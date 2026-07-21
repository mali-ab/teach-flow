package usecase

import (
	"context"
	"teachflow/internal/domain"
)

type UserRepoStore interface {
	Create(context.Context, *domain.User) error
	GetByEmail(context.Context, string) (*domain.User, error)
}

type MeetingRepoStore interface {
	Create(context.Context, *domain.Meeting) error
	GetByRoomName(context.Context, string) (*domain.Meeting, error)
	ListByCreator(context.Context, int64) ([]domain.Meeting, error)
}
