package handler

import (
	"net/http"
	"strconv"

	"time"

	"teachflow/internal/model"

	"github.com/gin-gonic/gin"
)

type CreateMeetingRequest struct {
	Title     string `json:"title"`
	CreatorID int64  `json:"creator_id"`
}

func (h *Handler) CreateMeeting(c *gin.Context) {
	var req CreateMeetingRequest

	if err := c.ShouldBindJSON(&req); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	meeting := &model.Meeting{
		Title:     req.Title,
		RoomName:  generateRoomName(req.Title),
		CreatorID: req.CreatorID,
		CreatedAt: time.Now(),
	}

	err := h.meetingRepo.Create(meeting)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"meeting": gin.H{
			"id":         meeting.ID,
			"title":      meeting.Title,
			"created_at": meeting.CreatedAt,
		},
		"room": gin.H{
			"server_url": h.jitsiURL,
			"room_name":  meeting.RoomName,
			"join_url":   h.jitsiURL + "/" + meeting.RoomName,
		},
	})
}

func (h *Handler) JoinMeeting(c *gin.Context) {

	roomName := c.Param("roomName")
	if roomName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid meeting name",
		})
		return
	}

	meeting, err := h.meetingRepo.GetByRoomName(roomName)
	if err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "meeting not found",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"meeting": gin.H{
			"id":         meeting.ID,
			"title":      meeting.Title,
			"created_at": meeting.CreatedAt,
		},
		"room": gin.H{
			"server_url": h.jitsiURL,
			"room_name":  meeting.RoomName,
			"join_url":   h.jitsiURL + "/" + meeting.RoomName,
		},
	})
}

func (h *Handler) GetMeetings(c *gin.Context) {

	id, err := strconv.ParseInt(
		c.Param("id"),
		10,
		64,
	)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid user id",
		})

		return
	}

	meetings, err := h.meetingRepo.GetByID(id)

	if err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "meeting not found",
		})

		return
	}

	c.JSON(http.StatusOK, meetings)
}
