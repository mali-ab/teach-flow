package usecase

import (
	"context"
	"strings"
	"teachflow/internal/domain"
)

type PasswordManager interface {
	Hash(string) (string, error)
	Compare(string, string) error
}

type TokenIssuer interface{ Issue(int64) (string, error) }

type AuthUseCase struct {
	users     UserRepoStore
	passwords PasswordManager
	tokens    TokenIssuer
}

func NewAuthUseCase(users UserRepoStore, passwords PasswordManager, tokens TokenIssuer) *AuthUseCase {
	return &AuthUseCase{users: users, passwords: passwords, tokens: tokens}
}

func (u *AuthUseCase) Register(ctx context.Context, newUser RegisterDTO) (*AuthResult, error) {
	newUser.Name, newUser.Email = strings.TrimSpace(newUser.Name), strings.TrimSpace(strings.ToLower(newUser.Email))
	if newUser.Name == "" || newUser.Email == "" || len(newUser.Password) < 8 {
		return nil, domain.ErrValidation
	}
	hash, err := u.passwords.Hash(newUser.Password)
	if err != nil {
		return nil, err
	}
	user := &domain.User{Name: newUser.Name, Email: newUser.Email, PasswordHash: hash}
	if err := u.users.Create(ctx, user); err != nil {
		return nil, err
	}

	userDTO := &UserDTO{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}

	return u.resultFor(userDTO)
}

func (u *AuthUseCase) Login(ctx context.Context, userLogin LoginDTO) (*AuthResult, error) {
	user, err := u.users.GetByEmail(ctx, strings.TrimSpace(strings.ToLower(userLogin.Email)))
	if err != nil || u.passwords.Compare(userLogin.Password, user.PasswordHash) != nil {
		return nil, domain.ErrInvalidCredentials
	}

	userDTO := &UserDTO{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}

	return u.resultFor(userDTO)
}

func (u *AuthUseCase) resultFor(user *UserDTO) (*AuthResult, error) {
	token, err := u.tokens.Issue(user.ID)
	if err != nil {
		return nil, err
	}
	return &AuthResult{Token: token, User: *user}, nil
}
