package repository

import (
	"context"
	"database/sql"
	"errors"

	"teachflow/internal/domain"

	"github.com/lib/pq"
)

type UserRepository struct{ db *sql.DB }

func NewUserRepository(db *sql.DB) *UserRepository { return &UserRepository{db: db} }

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
	const query = `INSERT INTO users(name, email, password_hash) VALUES($1, $2, $3) RETURNING id`
	err := r.db.QueryRowContext(ctx, query, user.Name, user.Email, user.PasswordHash).Scan(&user.ID)
	if err == nil {
		return nil
	}
	var pqErr *pq.Error
	if errors.As(err, &pqErr) && pqErr.Code == "23505" {
		return domain.ErrEmailExists
	}
	return err
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	const query = `SELECT id, name, email, password_hash FROM users WHERE email = $1`
	user := new(domain.User)
	err := r.db.QueryRowContext(ctx, query, email).Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}
