package repository

import (
	"context"
	"database/sql"
	"errors"

	"teachflow/internal/domain"
)

type MeetingRepository struct{ db *sql.DB }

func NewMeetingRepository(db *sql.DB) *MeetingRepository { return &MeetingRepository{db: db} }

func (r *MeetingRepository) Create(ctx context.Context, meeting *domain.Meeting) error {
	const query = `
		INSERT INTO meetings(title, room_name, creator_id, max_participants, meeting_duration_minutes)
		VALUES($1, $2, $3, $4, $5) RETURNING id, created_at`
	return r.db.QueryRowContext(ctx, query, meeting.Title, meeting.RoomName, meeting.CreatorID,
		meeting.MaxParticipants, meeting.MeetingDurationMinutes).Scan(&meeting.ID, &meeting.CreatedAt)
}

func (r *MeetingRepository) GetByRoomName(ctx context.Context, roomName string) (*domain.Meeting, error) {
	const query = `SELECT id, title, room_name, creator_id, max_participants, meeting_duration_minutes, created_at, ended_at FROM meetings WHERE room_name = $1`
	meeting := new(domain.Meeting)
	err := r.db.QueryRowContext(ctx, query, roomName).Scan(&meeting.ID, &meeting.Title, &meeting.RoomName,
		&meeting.CreatorID, &meeting.MaxParticipants, &meeting.MeetingDurationMinutes, &meeting.CreatedAt, &meeting.EndedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return meeting, nil
}

func (r *MeetingRepository) ListByCreator(ctx context.Context, creatorID int64) ([]domain.Meeting, error) {
	const query = `SELECT id, title, room_name, creator_id, max_participants, meeting_duration_minutes, created_at, ended_at FROM meetings WHERE creator_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query, creatorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	meetings := make([]domain.Meeting, 0)
	for rows.Next() {
		var meeting domain.Meeting
		if err := rows.Scan(&meeting.ID, &meeting.Title, &meeting.RoomName, &meeting.CreatorID,
			&meeting.MaxParticipants, &meeting.MeetingDurationMinutes, &meeting.CreatedAt, &meeting.EndedAt); err != nil {
			return nil, err
		}
		meetings = append(meetings, meeting)
	}
	return meetings, rows.Err()
}
