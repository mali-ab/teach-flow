package myHttp

import (
	"context"
	"teachflow/internal/usecase"
)

type AuthUsecaseStore interface {
	Register(ctx context.Context, newUser usecase.RegisterDTO) (*usecase.AuthResult, error)
	Login(ctx context.Context, userLogin usecase.LoginDTO) (*usecase.AuthResult, error)
}

type MeetingUsecaseStore interface {
	Create(ctx context.Context, creatorID int64, title string) (*usecase.MeetingDTO, error)
	GetByRoomName(ctx context.Context, roomName string) (*usecase.MeetingDTO, error)
	ListMine(ctx context.Context, userID int64) ([]usecase.MeetingDTO, error)
}
