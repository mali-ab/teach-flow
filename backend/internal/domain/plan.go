package domain

type Plan struct {
	ID                     int64
	Code                   string
	Name                   string
	MaxParticipants        int
	MeetingDurationMinutes *int
	Price                  float64
}
