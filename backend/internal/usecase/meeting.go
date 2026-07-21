package usecase

import (
	"context"
	"fmt"
	"strings"

	"teachflow/internal/domain"
	"time"
)

const defaultMaxParticipants = 5

type MeetingUseCase struct {
	meetings MeetingRepoStore
	now      func() time.Time
}

func NewMeetingUseCase(meetings MeetingRepoStore) *MeetingUseCase {
	return &MeetingUseCase{meetings: meetings, now: time.Now}
}

func (u *MeetingUseCase) Create(ctx context.Context, creatorID int64, title string) (*MeetingDTO, error) {
	title = strings.TrimSpace(title)
	if creatorID < 1 || title == "" || len(title) > 120 {
		return nil, domain.ErrValidation
	}
	now := u.now().UTC()
	meeting := &domain.Meeting{Title: title, RoomName: roomName(title, now), CreatorID: creatorID, MaxParticipants: defaultMaxParticipants}
	if err := u.meetings.Create(ctx, meeting); err != nil {
		return nil, err
	}

	meetingDTO := &MeetingDTO{
		ID:                     meeting.ID,
		Title:                  meeting.Title,
		RoomName:               meeting.RoomName,
		CreatorID:              meeting.CreatorID,
		MaxParticipants:        meeting.MaxParticipants,
		MeetingDurationMinutes: meeting.MeetingDurationMinutes,
		CreatedAt:              meeting.CreatedAt,
		EndedAt:                meeting.EndedAt,
	}

	return meetingDTO, nil
}

func (u *MeetingUseCase) GetByRoomName(ctx context.Context, roomName string) (*MeetingDTO, error) {
	if strings.TrimSpace(roomName) == "" {
		return nil, domain.ErrValidation
	}

	meeting, err := u.meetings.GetByRoomName(ctx, roomName)
	if err != nil {
		return nil, err
	}

	meetingDTO := &MeetingDTO{
		ID:                     meeting.ID,
		Title:                  meeting.Title,
		RoomName:               meeting.RoomName,
		CreatorID:              meeting.CreatorID,
		MaxParticipants:        meeting.MaxParticipants,
		MeetingDurationMinutes: meeting.MeetingDurationMinutes,
		CreatedAt:              meeting.CreatedAt,
		EndedAt:                meeting.EndedAt,
	}

	return meetingDTO, nil
}

func (u *MeetingUseCase) ListMine(ctx context.Context, userID int64) ([]MeetingDTO, error) {
	if userID < 1 {
		return nil, domain.ErrValidation
	}

	meetings, err := u.meetings.ListByCreator(ctx, userID)
	if err != nil {
		return nil, err
	}

	var meetingsDTO []MeetingDTO

	for _, m := range meetings {
		meeting := MeetingDTO{
			ID:                     m.ID,
			Title:                  m.Title,
			RoomName:               m.RoomName,
			CreatorID:              m.CreatorID,
			MaxParticipants:        m.MaxParticipants,
			MeetingDurationMinutes: m.MeetingDurationMinutes,
			CreatedAt:              m.CreatedAt,
			EndedAt:                m.EndedAt,
		}

		meetingsDTO = append(meetingsDTO, meeting)
	}

	return meetingsDTO, nil
}

func roomName(title string, now time.Time) string {
	name := strings.Join(strings.Fields(strings.ToLower(strings.TrimSpace(title))), "-")
	return fmt.Sprintf("%s-%d", name, now.UnixNano())
}
