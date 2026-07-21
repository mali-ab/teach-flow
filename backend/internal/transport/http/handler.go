package myHttp

import (
	"errors"
	"log"
	"net/http"
	"strings"

	"teachflow/internal/domain"

	"teachflow/internal/usecase"

	"github.com/gin-gonic/gin"
)

type TokenVerifier interface{ Parse(string) (int64, error) }

type Handler struct {
	auth     AuthUsecaseStore
	meetings MeetingUsecaseStore
	tokens   TokenVerifier
	jitsiURL string
}

func NewHandler(auth AuthUsecaseStore, meetings MeetingUsecaseStore, tokens TokenVerifier, jitsiURL string) *Handler {
	return &Handler{auth: auth, meetings: meetings, tokens: tokens, jitsiURL: strings.TrimRight(jitsiURL, "/")}
}

func (h *Handler) Register(c *gin.Context) {
	var request struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	dto := usecase.RegisterDTO{
		Name:     request.Name,
		Email:    request.Email,
		Password: request.Password,
	}

	result, err := h.auth.Register(c.Request.Context(), dto)
	if err != nil {
		h.writeError(c, err)
		return
	}

	userResponse := UserResponse{
		ID:    result.User.ID,
		Name:  result.User.Name,
		Email: result.User.Email,
	}

	c.JSON(http.StatusCreated, gin.H{"token": result.Token, "user": userResponse})
}

func (h *Handler) Login(c *gin.Context) {
	var request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	dto := usecase.LoginDTO{
		Email:    request.Email,
		Password: request.Password,
	}
	result, err := h.auth.Login(c.Request.Context(), dto)
	if err != nil {
		h.writeError(c, err)
		return
	}

	userResponse := UserResponse{
		ID:    result.User.ID,
		Name:  result.User.Name,
		Email: result.User.Email,
	}

	c.JSON(http.StatusOK, gin.H{"token": result.Token, "user": userResponse})
}

func (h *Handler) CreateMeeting(c *gin.Context) {
	var request struct {
		Title string `json:"title"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	meetingDTO, err := h.meetings.Create(c.Request.Context(), currentUserID(c), request.Title)
	if err != nil {
		log.Printf("request failed: %v", err)
		h.writeError(c, err)
		return
	}

	meeting := &MeetingResponse{
		ID:                     meetingDTO.ID,
		Title:                  meetingDTO.Title,
		RoomName:               meetingDTO.RoomName,
		CreatorID:              meetingDTO.CreatorID,
		MaxParticipants:        meetingDTO.MaxParticipants,
		MeetingDurationMinutes: meetingDTO.MeetingDurationMinutes,
		CreatedAt:              meetingDTO.CreatedAt,
		EndedAt:                meetingDTO.EndedAt,
	}

	c.JSON(http.StatusCreated, h.meetingResponse(meeting))
}

func (h *Handler) ListMeetings(c *gin.Context) {
	meetings, err := h.meetings.ListMine(c.Request.Context(), currentUserID(c))
	if err != nil {
		h.writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"meetings": meetings})
}

func (h *Handler) JoinMeeting(c *gin.Context) {
	meetingDTO, err := h.meetings.GetByRoomName(c.Request.Context(), c.Param("roomName"))
	if err != nil {
		h.writeError(c, err)
		return
	}

	meeting := &MeetingResponse{
		ID:                     meetingDTO.ID,
		Title:                  meetingDTO.Title,
		RoomName:               meetingDTO.RoomName,
		CreatorID:              meetingDTO.CreatorID,
		MaxParticipants:        meetingDTO.MaxParticipants,
		MeetingDurationMinutes: meetingDTO.MeetingDurationMinutes,
		CreatedAt:              meetingDTO.CreatedAt,
		EndedAt:                meetingDTO.EndedAt,
	}
	c.JSON(http.StatusOK, h.meetingResponse(meeting))
}

func (h *Handler) AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization required"})
			return
		}
		userID, err := h.tokens.Parse(strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid access token"})
			return
		}
		c.Set("user_id", userID)
		c.Next()
	}
}

func (h *Handler) meetingResponse(meeting *MeetingResponse) gin.H {
	return gin.H{"meeting": meeting, "room": gin.H{"server_url": h.jitsiURL, "room_name": meeting.RoomName, "join_url": h.jitsiURL + "/" + meeting.RoomName}}
}

func (h *Handler) writeError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, domain.ErrValidation):
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
	case errors.Is(err, domain.ErrEmailExists):
		c.JSON(http.StatusConflict, gin.H{"error": "email already exists"})
	case errors.Is(err, domain.ErrInvalidCredentials):
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
	case errors.Is(err, domain.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
	}
}

func currentUserID(c *gin.Context) int64 { return c.MustGet("user_id").(int64) }
