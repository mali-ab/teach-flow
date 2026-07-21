package app

import (
	"fmt"
	"log"

	"teachflow/internal/config"
	"teachflow/internal/database"
	"teachflow/internal/repository"
	"teachflow/internal/security"
	myHttp "teachflow/internal/transport/http"
	"teachflow/internal/usecase"
)

// Run composes infrastructure adapters and starts the HTTP delivery layer.
func Run() error {
	cfg := config.Load()
	db, err := database.NewPostgres(cfg)
	if err != nil {
		return fmt.Errorf("database connection failed: %w", err)
	}
	defer db.Close()

	users := repository.NewUserRepository(db)
	meetings := repository.NewMeetingRepository(db)
	tokens := security.NewJWTService(cfg.JWTSecret)
	authUseCase := usecase.NewAuthUseCase(users, security.PasswordService{}, tokens)
	meetingUseCase := usecase.NewMeetingUseCase(meetings)
	handler := myHttp.NewHandler(authUseCase, meetingUseCase, tokens, cfg.JitsiURL)

	addr := fmt.Sprintf("%s:%s", cfg.ServerHost, cfg.ServerPort)
	log.Printf("server started on %s", addr)
	return myHttp.NewRouter(handler).Run(addr)
}
