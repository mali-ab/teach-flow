package repository

import (
	"database/sql"
	"errors"
	"teachflow/internal/model"
)

type MeetingRepository struct {
	db *sql.DB
}

func NewMeetingRepository(db *sql.DB) *MeetingRepository {
	return &MeetingRepository{
		db: db,
	}
}

func (r *MeetingRepository) Create(meeting *model.Meeting) error {

	query := `
	INSERT INTO meetings(title, room_name, creator_id)
	VALUES($1, $2, $3)
	RETURNING id, created_at
	`

	return r.db.QueryRow(
		query,
		meeting.Title,
		meeting.RoomName,
		meeting.CreatorID,
	).Scan(
		&meeting.ID,
		&meeting.CreatedAt,
	)
}

func (r *MeetingRepository) GetByRoomName(roomName string) (*model.Meeting, error) {

	query := `
	SELECT id, title, room_name, creator_id, created_at
	FROM meetings
	WHERE room_name = $1
	`

	var meeting model.Meeting

	err := r.db.QueryRow(query, roomName).Scan(
		&meeting.ID,
		&meeting.Title,
		&meeting.RoomName,
		&meeting.CreatorID,
		&meeting.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &meeting, nil
}

func (r *MeetingRepository) GetByID(id int64) ([]model.Meeting, error) {

	query := `
	SELECT id, title, room_name, creator_id, created_at
	FROM meetings
	WHERE creator_id = $1
	`

	var meeting model.Meeting

	rows, err := r.db.Query(query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if err = rows.Err(); err != nil {
		return nil, errors.Join(NoMeetingYet, err)
	}

	var meetings []model.Meeting

	for rows.Next() {
		err := rows.Scan(
			&meeting.ID,
			&meeting.Title,
			&meeting.RoomName,
			&meeting.CreatorID,
			&meeting.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		meetings = append(meetings, meeting)
	}

	return meetings, nil
}
