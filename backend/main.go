package main

import (
  "context"
  "crypto/hmac"
  "crypto/rand"
  "crypto/sha256"
  "database/sql"
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
  "sync"
  "time"

  "github.com/joho/godotenv"
  _ "github.com/lib/pq"
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

type MeetingParticipantPayload struct {
  ParticipantID   string `json:"participantId,omitempty"`
  IsScreenSharing bool   `json:"isScreenSharing"`
}

type ChatMessage struct {
  ID        int64     `json:"id"`
  Sender    string    `json:"sender"`
  Text      string    `json:"text"`
  TimeStamp string    `json:"time"`
}

type MeetingChatSendPayload struct {
  Text string `json:"text"`
}


type RoomParticipant struct {
  ID              string `json:"id"`
  Name            string `json:"name"`
  JoinedAt        string `json:"joinedAt"`
  IsScreenSharing bool   `json:"isScreenSharing"`
  LastSeen        time.Time `json:"-"`
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
  User  *User  `json:"user,omitempty"`
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
  db     *sql.DB

  participantStoreMu sync.RWMutex
  participantStore   = make(map[string]map[string]RoomParticipant)
)

func main() {
  if err := godotenv.Load(); err != nil {
    log.Printf("no .env file loaded: %v", err)
  }

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

  host := os.Getenv("BACKEND_HOST")
  if host == "" {
    host = "0.0.0.0"
  }

  config = AppConfig{
    ListenAddr:      fmt.Sprintf("%s:%s", host, port),
    PasswordSalt:    getEnv("PASSWORD_SALT", "teachflow-salt"),
    JitsiBaseURL:    getEnv("JITSI_BASE_URL", "http://localhost:8000"),
    JitsiAppID:      os.Getenv("JITSI_APP_ID"),
    JitsiAppSecret:  os.Getenv("JITSI_APP_SECRET"),
    TokenTTLSeconds: 86400,
    DBHost:         getEnv("POSTGRES_HOST", "127.0.0.1"),
    DBPort:         getEnv("POSTGRES_PORT", "5433"),
    DBUser:         getEnv("POSTGRES_USER", "postgres"),
    DBPassword:     getEnv("POSTGRES_PASSWORD", "Qwerty1234"),
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

func initDB() {
  dsn := os.Getenv("DATABASE_URL")
  if dsn == "" {
    dsn = fmt.Sprintf(
      "host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
      config.DBHost,
      config.DBPort,
      config.DBUser,
      config.DBPassword,
      config.DBName,
    )
  }

  var err error
  db, err = sql.Open("postgres", dsn)
  if err != nil {
    log.Fatalf("failed to open postgres connection: %v", err)
  }

  db.SetMaxOpenConns(10)
  db.SetMaxIdleConns(2)
  db.SetConnMaxLifetime(30 * time.Minute)

  if err := db.Ping(); err != nil {
    log.Fatalf("failed to ping postgres: %v", err)
  }

  if err := createSchema(); err != nil {
    log.Fatalf("failed to create schema: %v", err)
  }
}

func createSchema() error {
  schema := `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  room_name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TEXT,
  duration_minutes INTEGER,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
`
  _, err := db.Exec(schema)
  return err
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

  writeJSON(w, http.StatusOK, TokenResponse{
    Token: createSession(user.ID),
    User: &User{ID: user.ID, Name: user.Name, Email: user.Email},
  })
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
    ID:             randomID(36),
    // UUID-like opaque room code (client uses it in /meeting/:id)
    RoomName:       randomID(36),
    Title:          payload.Title,
    Description:    payload.Description,
    ScheduledAt:    payload.ScheduledAt,
    DurationMinutes: payload.DurationMinutes,
    CreatedAt:      time.Now().UTC().Format(time.RFC3339),
  }


  if err := insertMeeting(meeting); err != nil {
    writeError(w, http.StatusInternalServerError, "failed to save meeting")
    return
  }

  writeJSON(w, http.StatusCreated, meeting)
}

func meetingPathHandler(w http.ResponseWriter, r *http.Request) {
  if r.Method == http.MethodOptions {
    return
  }

  path := strings.TrimPrefix(r.URL.Path, "/api/meetings/")
  parts := strings.Split(path, "/")
  roomName := strings.TrimSpace(parts[0])
  if roomName == "" {
    writeError(w, http.StatusBadRequest, "meeting id is required")
    return
  }

  if len(parts) == 2 && parts[1] == "join" {
    joinMeetingHandler(w, r, roomName)
    return
  }

  if len(parts) == 2 && parts[1] == "participants" {
    switch r.Method {
    case http.MethodGet:
      listParticipantsHandler(w, r, roomName)
    case http.MethodPost:
      upsertParticipantHandler(w, r, roomName)
    default:
      writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
    }
    return
  }

  if len(parts) == 3 && parts[1] == "participants" {
    if r.Method == http.MethodDelete {
      removeParticipantHandler(w, r, roomName, parts[2])
      return
    }
  }

  writeError(w, http.StatusNotFound, "endpoint not found")
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

func upsertParticipantHandler(w http.ResponseWriter, r *http.Request, roomName string) {
  currentUser := r.Context().Value(contextKey("user")).(*User)
  if currentUser == nil {
    writeError(w, http.StatusUnauthorized, "not authorized")
    return
  }

  var payload MeetingParticipantPayload
  if err := decodeJSONBody(r, &payload); err != nil {
    writeError(w, http.StatusBadRequest, err.Error())
    return
  }

  participantID := strings.TrimSpace(payload.ParticipantID)
  if participantID == "" {
    participantID = randomID(8)
  }

  now := time.Now().UTC()
  participantStoreMu.Lock()
  if participantStore[roomName] == nil {
    participantStore[roomName] = make(map[string]RoomParticipant)
  }
  participantStore[roomName][participantID] = RoomParticipant{
    ID:              participantID,
    Name:            currentUser.Name,
    JoinedAt:        now.Format(time.RFC3339),
    IsScreenSharing: payload.IsScreenSharing,
    LastSeen:        now,
  }
  participantStoreMu.Unlock()

  listParticipantsHandler(w, r, roomName)
}

func listParticipantsHandler(w http.ResponseWriter, r *http.Request, roomName string) {
  participantStoreMu.Lock()
  defer participantStoreMu.Unlock()

  participants := make([]RoomParticipant, 0)
  roomParticipants := participantStore[roomName]
  if roomParticipants == nil {
    writeJSON(w, http.StatusOK, map[string]any{"participants": participants})
    return
  }

  now := time.Now().UTC()
  for _, participant := range roomParticipants {
    if now.Sub(participant.LastSeen) > 20*time.Second {
      delete(roomParticipants, participant.ID)
      continue
    }
    participants = append(participants, participant)
  }

  writeJSON(w, http.StatusOK, map[string]any{"participants": participants})
}

func removeParticipantHandler(w http.ResponseWriter, r *http.Request, roomName, participantID string) {
  participantStoreMu.Lock()
  defer participantStoreMu.Unlock()

  if roomParticipants := participantStore[roomName]; roomParticipants != nil {
    delete(roomParticipants, participantID)
    if len(roomParticipants) == 0 {
      delete(participantStore, roomName)
    }
  }

  writeJSON(w, http.StatusOK, map[string]any{"participants": []RoomParticipant{}})
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

    token := authHeaderToken(authHeader)
    if token == "" {
      writeError(w, http.StatusUnauthorized, "invalid Authorization header")
      return
    }

    user, ok := findUserByToken(token)
    if !ok {
      writeError(w, http.StatusUnauthorized, "invalid or expired token")
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
  expiresAt := time.Now().Add(time.Duration(config.TokenTTLSeconds) * time.Second)
  if err := insertSession(token, userID, expiresAt); err != nil {
    log.Printf("failed to insert session: %v", err)
  }
  return token
}

func findUserByEmail(email string) (*User, bool) {
  lowerEmail := strings.ToLower(email)
  user := &User{}
  err := db.QueryRow(
    `SELECT id, name, email, password_hash FROM users WHERE email = LOWER($1)`,
    lowerEmail,
  ).Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash)
  if err != nil {
    if err == sql.ErrNoRows {
      return nil, false
    }
    log.Printf("findUserByEmail error: %v", err)
    return nil, false
  }
  return user, true
}

func findUserByToken(token string) (*User, bool) {
  user := &User{}
  err := db.QueryRow(
    `SELECT u.id, u.name, u.email, u.password_hash
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = $1 AND s.expires_at > NOW()`,
    token,
  ).Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash)
  if err != nil {
    if err == sql.ErrNoRows {
      return nil, false
    }
    log.Printf("findUserByToken error: %v", err)
    return nil, false
  }
  return user, true
}

func insertUser(user *User) error {
  _, err := db.Exec(
    `INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, LOWER($3), $4)`,
    user.ID,
    user.Name,
    user.Email,
    user.PasswordHash,
  )
  return err
}

func insertSession(token, userID string, expiresAt time.Time) error {
  _, err := db.Exec(
    `INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)`,
    token,
    userID,
    expiresAt,
  )
  return err
}

func insertMeeting(meeting *Meeting) error {
  _, err := db.Exec(
    `INSERT INTO meetings (id, room_name, title, description, scheduled_at, duration_minutes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    meeting.ID,
    meeting.RoomName,
    meeting.Title,
    meeting.Description,
    meeting.ScheduledAt,
    meeting.DurationMinutes,
    meeting.CreatedAt,
  )
  return err
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
    origin := r.Header.Get("Origin")
    if origin != "" {
      w.Header().Set("Access-Control-Allow-Origin", origin)
      w.Header().Set("Access-Control-Allow-Credentials", "true")
      w.Header().Set("Vary", "Origin")
    } else {
      w.Header().Set("Access-Control-Allow-Origin", "*")
    }
    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    if r.Method == http.MethodOptions {
      w.WriteHeader(http.StatusNoContent)
      return
    }
    next(w, r)
  }
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
