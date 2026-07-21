package myHttp

import "time"

type MeetingResponse struct {
	ID                     int64      `json:"id"`
	Title                  string     `json:"title"`
	RoomName               string     `json:"room_name"`
	CreatorID              int64      `json:"creator_id"`
	MaxParticipants        int        `json:"max_participants"`
	MeetingDurationMinutes *int       `json:"meeting_duration_minutes"`
	CreatedAt              time.Time  `json:"created_at"`
	EndedAt                *time.Time `json:"ended_at"`
}

type UserResponse struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}
