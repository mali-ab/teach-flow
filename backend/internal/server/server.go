package server

import (
	"database/sql"
	"teachflow/internal/handler"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/gin-contrib/cors"
)

type Server struct {
	engine  *gin.Engine
	handler *handler.Handler
}

func New(
	db *sql.DB,
	jwtSecret string,
	jitsiURL string,
) *Server {

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"*",
		},

		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
		},

		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
		},

		ExposeHeaders: []string{
			"Content-Length",
		},

		AllowCredentials: true,

		MaxAge: 12 * time.Hour,
	}))

	s := &Server{
		engine:  r,
		handler: handler.New(db, jwtSecret, jitsiURL),
	}

	s.routes()

	return s
}

func (s *Server) routes() {

	s.engine.POST("/api/auth/register", s.handler.Register)
	s.engine.POST("/api/auth/login", s.handler.Login)

	s.engine.POST("/api/meetings", s.handler.CreateMeeting)
	s.engine.GET("/api/meetings/join/:roomName", s.handler.JoinMeeting)
	s.engine.GET("/api/meetings/:id", s.handler.GetMeetings)

}

func (s *Server) Run(addr string) error {
	return s.engine.Run(addr)
}
