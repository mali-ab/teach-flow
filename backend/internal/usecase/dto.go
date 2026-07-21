package usecase

import "time"

type UserDTO struct {
	ID    int64
	Name  string
	Email string
}

type MeetingDTO struct {
	ID                     int64
	Title                  string
	RoomName               string
	CreatorID              int64
	MaxParticipants        int
	MeetingDurationMinutes *int
	CreatedAt              time.Time
	EndedAt                *time.Time
}

type AuthResult struct {
	Token string
	User  UserDTO
}

type RegisterDTO struct {
	Name     string
	Email    string
	Password string
}

type LoginDTO struct {
	Email    string
	Password string
}
