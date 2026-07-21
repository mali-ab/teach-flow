package handler

import (
	"fmt"
	"strings"
	"time"
)

func generateRoomName(roomName string) string {

	return fmt.Sprintf(
		"%s-%d",
		fixRoomName(roomName),
		time.Now().Unix(),
	)
}

func fixRoomName(roomName string) string {
	// Example fix: convert to lowercase and replace spaces with hyphens
	roomName = strings.ToLower(roomName)
	roomName = strings.ReplaceAll(roomName, " ", "-")
	return roomName
}
