package domain

// User is the core representation of an application user.
type User struct {
	ID           int64
	Name         string
	Email        string
	PasswordHash string
}
