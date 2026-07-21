package handler

import (
	"errors"
	"net/http"

	"teachflow/internal/auth"
	"teachflow/internal/model"
	"teachflow/internal/repository"

	"github.com/gin-gonic/gin"
)

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handler) Register(c *gin.Context) {

	var req RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	hash, err := auth.HashPassword(req.Password)
	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to hash password",
		})

		return
	}

	user := &model.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: hash,
	}

	err = h.userRepo.Create(user)

	if err != nil {

		if errors.Is(err, repository.ErrEmailExists) {

			c.JSON(http.StatusConflict, gin.H{
				"error": "email already exists",
			})

			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "internal server error",
		})

		return
	}

	token, err := auth.GenerateToken(
		user.ID,
		h.jwtSecret,
	)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "failed to generate token",
			},
		)

		return
	}

	c.JSON(http.StatusOK, gin.H{

		"token": token,

		"user": gin.H{

			"id": user.ID,

			"name": user.Name,

			"email": user.Email,
		},
	})
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handler) Login(c *gin.Context) {

	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	user, err := h.userRepo.GetByEmail(req.Email)

	if err != nil {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid email or password",
		})

		return
	}

	err = auth.CheckPassword(
		req.Password,
		user.PasswordHash,
	)

	if err != nil {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid email or password",
		})

		return
	}

	token, err := auth.GenerateToken(
		user.ID,
		h.jwtSecret,
	)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "failed to generate token",
			},
		)

		return
	}

	c.JSON(http.StatusOK, gin.H{

		"token": token,

		"user": gin.H{

			"id": user.ID,

			"name": user.Name,

			"email": user.Email,
		},
	})
}
