package security

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type claims struct {
	UserID int64 `json:"user_id"`
	jwt.RegisteredClaims
}

type JWTService struct{ secret []byte }

func NewJWTService(secret string) *JWTService { return &JWTService{secret: []byte(secret)} }

func (s *JWTService) Issue(userID int64) (string, error) {
	payload := claims{UserID: userID, RegisteredClaims: jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, payload).SignedString(s.secret)
}

func (s *JWTService) Parse(rawToken string) (int64, error) {
	parsed, err := jwt.ParseWithClaims(rawToken, &claims{}, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return s.secret, nil
	})
	if err != nil || !parsed.Valid {
		return 0, fmt.Errorf("invalid access token")
	}
	payload, ok := parsed.Claims.(*claims)
	if !ok || payload.UserID == 0 {
		return 0, fmt.Errorf("invalid access token")
	}
	return payload.UserID, nil
}
