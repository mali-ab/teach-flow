package domain

import "time"

type UserPlan struct {
	UserID int64
	Name   string
	Email  string

	PlanCode string
	PlanName string

	MaxParticipants        int
	MeetingDurationMinutes *int

	ExpiresAt *time.Time
}
