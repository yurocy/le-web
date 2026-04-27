package middleware

import (
	"le-go/internal/pkg/jwt"
	"le-go/internal/pkg/response"
	"strings"

	"github.com/gin-gonic/gin"
)

// JWTAuth JWT authentication middleware
func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			// Also check query parameter and form for backward compatibility
			token := c.Query("token")
			if token == "" {
				token = c.PostForm("token")
			}
			if token == "" {
				response.ErrorUnauthorized(c)
				c.Abort()
				return
			}
			authHeader = "Bearer " + token
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			response.ErrorUnauthorized(c)
			c.Abort()
			return
		}

		claims, err := jwt.ParseToken(parts[1])
		if err != nil {
			response.ErrorUnauthorized(c)
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("user_tel", claims.UserTel)
		c.Set("user_role", claims.Role)
		c.Set("username", claims.Username)
		c.Next()
	}
}

// OptionalJWTAuth optional JWT auth - doesn't abort if no token
func OptionalJWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			token := c.Query("token")
			if token == "" {
				token = c.PostForm("token")
			}
			if token != "" {
				authHeader = "Bearer " + token
			}
		}

		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && parts[0] == "Bearer" {
				if claims, err := jwt.ParseToken(parts[1]); err == nil {
					c.Set("user_id", claims.UserID)
					c.Set("user_tel", claims.UserTel)
					c.Set("user_role", claims.Role)
					c.Set("username", claims.Username)
				}
			}
		}
		c.Next()
	}
}
