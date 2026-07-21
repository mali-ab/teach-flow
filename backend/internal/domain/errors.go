package domain

import "errors"

var (
	ErrEmailExists        = errors.New("email already exists")
	ErrNotFound           = errors.New("resource not found")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrValidation         = errors.New("validation error")
)
