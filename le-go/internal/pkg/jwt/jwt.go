package jwt

import (
	"errors"
	"github.com/golang-jwt/jwt/v5"
	"le-go/internal/config"
	"time"
)

var (
	ErrTokenExpired = errors.New("token is expired")
	ErrTokenInvalid = errors.New("token is invalid")
)

// Claims custom JWT claims
type Claims struct {
	UserID   uint   `json:"user_id"`
	UserTel  string `json:"user_tel"`
	Role     int    `json:"role"` // 0:会员 1:代理 2:商家 3:门店 99:报价用户 100:分销用户 999:后台管理员
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// GenerateToken creates a new JWT token
func GenerateToken(userID uint, userTel string, role int, username string) (string, error) {
	claims := Claims{
		UserID:   userID,
		UserTel:  userTel,
		Role:     role,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(config.Cfg.JWT.ExpireHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.Cfg.JWT.Secret))
}

// ParseToken parses and validates a JWT token
func ParseToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.Cfg.JWT.Secret), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrTokenExpired
		}
		return nil, ErrTokenInvalid
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, ErrTokenInvalid
}
