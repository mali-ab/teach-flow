package model

import "time"

type Meeting struct {
	ID        int64
	Title     string
	RoomName  string
	CreatorID int64
	CreatedAt time.Time
}
