package myHttp

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func NewRouter(handler *Handler) *gin.Engine {
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		ExposeHeaders:    []string{"Content-Length"},
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/health", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })
	router.POST("/api/auth/register", handler.Register)
	router.POST("/api/auth/login", handler.Login)

	meetings := router.Group("/api/meetings")
	meetings.Use(handler.AuthRequired())
	meetings.POST("", handler.CreateMeeting)
	meetings.GET("", handler.ListMeetings)
	meetings.GET("/join/:roomName", handler.JoinMeeting)

	return router
}
