package handler

import (
	"database/sql"

	"teachflow/internal/repository"
)

type Handler struct {
	userRepo    *repository.UserRepository
	meetingRepo *repository.MeetingRepository

	jwtSecret string
	jitsiURL  string
}

func New(
	db *sql.DB,
	jwtSecret string,
	jitsiURL string,
) *Handler {

	return &Handler{
		userRepo:    repository.NewUserRepository(db),
		meetingRepo: repository.NewMeetingRepository(db),

		jwtSecret: jwtSecret,
		jitsiURL:  jitsiURL,
	}
}
