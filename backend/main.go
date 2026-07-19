package main

import (
  "context"
  "crypto/hmac"
  "crypto/rand"
  "crypto/sha256"
  "encoding/base64"
  "encoding/hex"
  "encoding/json"
  "fmt"
  "log"
  "math/big"
  "net/http"
  "net/url"
  "os"
  "strings"

  "time"
)

type AppConfig struct {
  ListenAddr      string
  PasswordSalt    string
  JitsiBaseURL    string
  JitsiAppID      string
  JitsiAppSecret  string
  TokenTTLSeconds int64
  DBHost          string
  DBPort          string
  DBUser          string
  DBPassword      string
  DBName          string
}

type User struct {
  ID           string `json:"id"`
  Name         string `json:"name"`
  Email        string `json:"email"`
  PasswordHash string `json:"-"`
}

type Meeting struct {
  ID             string `json:"id"`
  RoomName       string `json:"roomName"`
  Title          string `json:"title"`
  Description    string `json:"description,omitempty"`
  ScheduledAt    string `json:"scheduledAt,omitempty"`
  DurationMinutes int   `json:"durationMinutes,omitempty"`
  CreatedAt      string `json:"created_at"`
}

type CreateMeetingPayload struct {
  Title           string `json:"title"`
  Description     string `json:"description,omitempty"`
  ScheduledAt     string `json:"scheduledAt,omitempty"`
  DurationMinutes int    `json:"durationMinutes,omitempty"`
}

type RegisterPayload struct {
  Name     string `json:"name"`
  Email    string `json:"email"`
  Password string `json:"password"`
}

type LoginPayload struct {
  Email    string `json:"email"`
  Password string `json:"password"`
}

type TokenResponse struct {
  Token string `json:"token"`
}

type JoinResponse struct {
  URL      string `json:"url,omitempty"`
  RoomName string `json:"room_name,omitempty"`
  ID       string `json:"id,omitempty"`
}

type ErrorResponse struct {
  Message string `json:"message"`
}

type contextKey string

var (
  config AppConfig
)

func main() {
  loadConfig()
  initDB()
  seedDefaultUser()

  mux := http.NewServeMux()
  mux.HandleFunc("/api/health", withCORS(healthHandler))
  mux.HandleFunc("/api/auth/register", withCORS(registerHandler))
  mux.HandleFunc("/api/auth/login", withCORS(loginHandler))
  mux.HandleFunc("/api/meetings", withCORS(authMiddleware(createMeetingHandler)))
  mux.HandleFunc("/api/meetings/", withCORS(authMiddleware(meetingPathHandler)))

  log.Printf("TeachFlow Go backend listening at %s", config.ListenAddr)
  if err := http.ListenAndServe(config.ListenAddr, mux); err != nil {
    log.Fatalf("server failed: %v", err)
  }
}

func loadConfig() {
  port := os.Getenv("BACKEND_PORT")
  if port == "" {
    port = "8080"
  }

  config = AppConfig{
    ListenAddr:      fmt.Sprintf(":%s", port),
    PasswordSalt:    getEnv("PASSWORD_SALT", "teachflow-salt"),
    JitsiBaseURL:    getEnv("JITSI_BASE_URL", "http://localhost:8000"),
    JitsiAppID:      os.Getenv("JITSI_APP_ID"),
    JitsiAppSecret:  os.Getenv("JITSI_APP_SECRET"),
    TokenTTLSeconds: 86400,
    DBHost:         getEnv("POSTGRES_HOST", "localhost"),
    DBPort:         getEnv("POSTGRES_PORT", "5432"),
    DBUser:         getEnv("POSTGRES_USER", "teachflow"),
    DBPassword:     getEnv("POSTGRES_PASSWORD", "teachflow"),
    DBName:         getEnv("POSTGRES_DB", "teachflow"),
  }
}

func getEnv(key, fallback string) string {
  if value := os.Getenv(key); value != "" {
    return value
  }
  return fallback
}

func seedDefaultUser() {
  defaultEmail := "teacher@teachflow.local"
  if _, ok := findUserByEmail(defaultEmail); ok {
    return
  }

  err := insertUser(&User{
    ID:           randomID(10),
    Name:         "Default Teacher",
    Email:        defaultEmail,
    PasswordHash: hashPassword("password123"),
  })
  if err != nil {
    log.Fatalf("failed to seed default user: %v", err)
  }
  log.Printf("created default user: %s / password123", defaultEmail)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
  writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
  if r.Method == http.MethodOptions {
    return
  }
  if r.Method != http.MethodPost {
    writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
    return
  }

  var payload RegisterPayload
  if err := decodeJSONBody(r, &payload); err != nil {
    writeError(w, http.StatusBadRequest, err.Error())
    return
  }

  if payload.Name == "" || payload.Email == "" || payload.Password == "" {
    writeError(w, http.StatusBadRequest, "name, email and password are required")
    return
  }

  if _, exists := findUserByEmail(payload.Email); exists {
    writeError(w, http.StatusBadRequest, "email already registered")
    return
  }

  user := &User{
    ID:           randomID(12),
    Name:         payload.Name,
    Email:        strings.ToLower(payload.Email),
    PasswordHash: hashPassword(payload.Password),
  }

  if err := insertUser(user); err != nil {
    writeError(w, http.StatusInternalServerError, "failed to create user")
    return
  }

  writeJSON(w, http.StatusCreated, map[string]any{
    "message": "registration complete",
    "token":   createSession(user.ID),
  })
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
  if r.Method == http.MethodOptions {
    return
  }
  if r.Method != http.MethodPost {
    writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
    return
  }

  var payload LoginPayload
  if err := decodeJSONBody(r, &payload); err != nil {
    writeError(w, http.StatusBadRequest, err.Error())
    return
  }

  user, exists := findUserByEmail(payload.Email)
  if !exists || !checkPassword(payload.Password, user.PasswordHash) {
    writeError(w, http.StatusUnauthorized, "invalid email or password")
    return
  }

  writeJSON(w, http.StatusOK, TokenResponse{Token: createSession(user.ID)})
}

func createMeetingHandler(w http.ResponseWriter, r *http.Request) {
  if r.Method == http.MethodOptions {
    return
  }
  if r.Method != http.MethodPost {
    writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
    return
  }

  currentUser := r.Context().Value(contextKey("user")).(*User)
  if currentUser == nil {
    writeError(w, http.StatusUnauthorized, "not authorized")
    return
  }

  var payload CreateMeetingPayload
  if err := decodeJSONBody(r, &payload); err != nil {
    writeError(w, http.StatusBadRequest, err.Error())
    return
  }

  if strings.TrimSpace(payload.Title) == "" {
    writeError(w, http.StatusBadRequest, "title is required")
    return
  }

  meeting := &Meeting{
    ID:             randomID(12),
    RoomName:       generateRoomName(payload.Title),
    Title:          payload.Title,
    Description:    payload.Description,
    ScheduledAt:    payload.ScheduledAt,
    DurationMinutes: payload.DurationMinutes,
    CreatedAt:      time.Now().UTC().Format(time.RFC3339),
  }

  mu.Lock()
  meetings[meeting.ID] = meeting
  mu.Unlock()

  writeJSON(w, http.StatusCreated, meeting)
}

func meetingPathHandler(w http.ResponseWriter, r *http.Request) {
  if r.Method == http.MethodOptions {
    return
  }

  path := strings.TrimPrefix(r.URL.Path, "/api/meetings/")
  parts := strings.Split(path, "/")
  if len(parts) != 2 || parts[1] != "join" {
    writeError(w, http.StatusNotFound, "endpoint not found")
    return
  }

  roomName := strings.TrimSpace(parts[0])
  if roomName == "" {
    writeError(w, http.StatusBadRequest, "meeting id is required")
    return
  }

  joinMeetingHandler(w, r, roomName)
}

func joinMeetingHandler(w http.ResponseWriter, r *http.Request, roomName string) {
  currentUser := r.Context().Value(contextKey("user")).(*User)
  if currentUser == nil {
    writeError(w, http.StatusUnauthorized, "not authorized")
    return
  }

  joinURL := buildJitsiURL(roomName, currentUser)
  writeJSON(w, http.StatusOK, JoinResponse{
    URL:      joinURL,
    RoomName: roomName,
    ID:       roomName,
  })
}

func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    if r.Method == http.MethodOptions {
      return
    }

    authHeader := r.Header.Get("Authorization")
    if authHeader == "" {
      writeError(w, http.StatusUnauthorized, "missing Authorization header")
      return
    }

    token := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer"))
    if token == "" {
      writeError(w, http.StatusUnauthorized, "invalid Authorization header")
      return
    }

    mu.RLock()
    userID, ok := sessions[token]
    mu.RUnlock()
    if !ok {
      writeError(w, http.StatusUnauthorized, "session not found")
      return
    }

    mu.RLock()
    user := users[userID]
    mu.RUnlock()
    if user == nil {
      writeError(w, http.StatusUnauthorized, "user not found")
      return
    }

    ctx := r.Context()
    ctx = contextWithUser(ctx, user)
    next(w, r.WithContext(ctx))
  }
}

func contextWithUser(ctx context.Context, user *User) context.Context {
  return context.WithValue(ctx, contextKey("user"), user)
}

func createSession(userID string) string {
  token := randomID(24)
  mu.Lock()
  sessions[token] = userID
  mu.Unlock()
  return token
}

func findUserByEmail(email string) (*User, bool) {
  lower := strings.ToLower(email)
  mu.RLock()
  defer mu.RUnlock()
  for _, user := range users {
    if strings.ToLower(user.Email) == lower {
      return user, true
    }
  }
  return nil, false
}

func hashPassword(password string) string {
  sum := sha256.Sum256([]byte(password + config.PasswordSalt))
  return hex.EncodeToString(sum[:])
}

func checkPassword(password, hash string) bool {
  return hashPassword(password) == hash
}

func randomID(length int) string {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  result := make([]byte, length)
  for i := range result {
    n, err := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
    if err != nil {
      panic(err)
    }
    result[i] = alphabet[n.Int64()]
  }
  return string(result)
}

func generateRoomName(title string) string {
  clean := strings.ToLower(strings.TrimSpace(title))
  clean = strings.ReplaceAll(clean, " ", "-")
  clean = strings.Map(func(r rune) rune {
    switch {
    case r >= 'a' && r <= 'z', r >= '0' && r <= '9', r == '-':
      return r
    default:
      return -1
    }
  }, clean)
  if clean == "" {
    clean = "teachflow-room"
  }
  return fmt.Sprintf("%s-%s", clean, randomID(5))
}

func buildJitsiURL(roomName string, user *User) string {
  base := strings.TrimRight(config.JitsiBaseURL, "/")
  escapedRoom := url.PathEscape(roomName)
  if config.JitsiAppSecret == "" {
    return fmt.Sprintf("%s/%s", base, escapedRoom)
  }

  token, err := generateJWT(roomName, user)
  if err != nil {
    log.Printf("failed to generate jitsi jwt: %v", err)
    return fmt.Sprintf("%s/%s", base, escapedRoom)
  }

  return fmt.Sprintf("%s/%s?jwt=%s", base, escapedRoom, url.QueryEscape(token))
}

func generateJWT(roomName string, user *User) (string, error) {
  header := map[string]any{"alg": "HS256", "typ": "JWT"}
  payload := map[string]any{
    "aud": "jitsi",
    "iss": config.JitsiAppID,
    "sub": "meet.jitsi",
    "room": roomName,
    "exp": time.Now().Add(2 * time.Hour).Unix(),
    "context": map[string]any{
      "user": map[string]any{
        "name": user.Name,
        "email": user.Email,
      },
    },
  }

  headerJSON, err := json.Marshal(header)
  if err != nil {
    return "", err
  }
  payloadJSON, err := json.Marshal(payload)
  if err != nil {
    return "", err
  }

  encodedHeader := base64.RawURLEncoding.EncodeToString(headerJSON)
  encodedPayload := base64.RawURLEncoding.EncodeToString(payloadJSON)
  signingInput := fmt.Sprintf("%s.%s", encodedHeader, encodedPayload)

  mac := hmac.New(sha256.New, []byte(config.JitsiAppSecret))
  mac.Write([]byte(signingInput))
  signature := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))

  return fmt.Sprintf("%s.%s.%s", encodedHeader, encodedPayload, signature), nil
}

func writeJSON(w http.ResponseWriter, code int, data any) {
  w.Header().Set("Content-Type", "application/json")
  w.WriteHeader(code)
  if err := json.NewEncoder(w).Encode(data); err != nil {
    log.Printf("failed to write JSON: %v", err)
  }
}

func writeError(w http.ResponseWriter, code int, message string) {
  writeJSON(w, code, ErrorResponse{Message: message})
}

func decodeJSONBody(r *http.Request, dst any) error {
  decoder := json.NewDecoder(r.Body)
  decoder.DisallowUnknownFields()
  if err := decoder.Decode(dst); err != nil {
    return fmt.Errorf("invalid request body: %w", err)
  }
  return nil
}

func withCORS(next http.HandlerFunc) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    if r.Method == http.MethodOptions {
      w.WriteHeader(http.StatusNoContent)
      return
    }
    next(w, r)
  }
}

func contextWithUser(ctx context.Context, user *User) context.Context {
  return context.WithValue(ctx, contextKey("user"), user)
}

func authHeaderToken(header string) string {
  if header == "" {
    return ""
  }
  token := strings.TrimSpace(strings.TrimPrefix(header, "Bearer"))
  if token == "" {
    return strings.TrimSpace(strings.TrimPrefix(header, "bearer"))
  }
  return token
}
