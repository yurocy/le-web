package middleware

import (
	"le-go/internal/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

// RequireRole checks if the authenticated user has the required role
func RequireRole(roles ...int) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("user_role")
		if !exists {
			response.ErrorUnauthorized(c)
			c.Abort()
			return
		}

		role, ok := roleVal.(int)
		if !ok {
			response.ErrorUnauthorized(c)
			c.Abort()
			return
		}

		for _, r := range roles {
			if role == r {
				c.Next()
				return
			}
		}

		response.Error(c, response.CodeIllegal, "权限不足")
		c.Abort()
	}
}

// RequireAdmin checks if user is a backend admin (role >= 1000)
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("user_role")
		if !exists {
			response.ErrorUnauthorized(c)
			c.Abort()
			return
		}
		role, _ := strconv.Atoi(roleVal.(string))
		if role < 1000 {
			response.Error(c, response.CodeIllegal, "需要管理员权限")
			c.Abort()
			return
		}
		c.Next()
	}
}
