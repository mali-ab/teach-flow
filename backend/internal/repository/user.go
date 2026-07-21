package repository

import (
	"database/sql"
	"teachflow/internal/model"

	"github.com/lib/pq"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (r *UserRepository) Create(user *model.User) error {

	query := `
	INSERT INTO users(name, email, password_hash)
	VALUES($1, $2, $3)
	RETURNING id
	`

	err := r.db.QueryRow(
		query,
		user.Name,
		user.Email,
		user.PasswordHash,
	).Scan(&user.ID)

	if err != nil {

		if pqErr, ok := err.(*pq.Error); ok {

			if pqErr.Code == "23505" {
				return ErrEmailExists
			}
		}

		return err
	}

	return nil
}

func (r *UserRepository) GetByEmail(email string) (*model.User, error) {

	query := `
	SELECT id, name, email, password_hash
	FROM users
	WHERE email = $1
	`

	var user model.User

	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}
