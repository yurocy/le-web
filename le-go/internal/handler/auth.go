package handler

import (
	"le-go/internal/model"
	"le-go/internal/pkg/jwt"
	"le-go/internal/pkg/response"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Login handles admin user login.
// POST /api/v1/auth/login
// Body: {"username": "...", "password": "..."}
func Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "用户名和密码不能为空")
		return
	}

	// Look up admin user by username
	var adminUser model.AdminUser
	if err := model.DB.Where("username = ?", req.Username).First(&adminUser).Error; err != nil {
		response.Error(c, response.CodeLoginFailed, response.ErrorCode(response.CodeLoginFailed))
		return
	}

	// Check if account is disabled
	if adminUser.Status == model.StatusDisabled {
		response.Error(c, response.CodeIllegal, "账号已被禁用")
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(adminUser.Password), []byte(req.Password)); err != nil {
		response.Error(c, response.CodeLoginFailed, response.ErrorCode(response.CodeLoginFailed))
		return
	}

	// Generate JWT token
	token, err := jwt.GenerateToken(adminUser.ID, adminUser.Phone, adminUser.Role, adminUser.Username)
	if err != nil {
		response.ErrorServer(c)
		return
	}

	response.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":        adminUser.ID,
			"username":  adminUser.Username,
			"real_name": adminUser.RealName,
			"phone":     adminUser.Phone,
			"email":     adminUser.Email,
			"avatar":    adminUser.Avatar,
			"role":      adminUser.Role,
		},
	})
}

// Register handles admin user registration.
// POST /api/v1/auth/register
// Body: {"username": "...", "password": "...", "real_name": "...", "phone": "..."}
func Register(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required,min=2,max=50"`
		Password string `json:"password" binding:"required,min=6"`
		RealName string `json:"real_name"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "信息填写有误")
		return
	}

	// Check if username already exists
	var count int64
	model.DB.Model(&model.AdminUser{}).Where("username = ?", req.Username).Count(&count)
	if count > 0 {
		response.Error(c, response.CodePhoneExists, "用户名已存在")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		response.ErrorServer(c)
		return
	}

	adminUser := model.AdminUser{
		Username: req.Username,
		Password: string(hashedPassword),
		RealName: req.RealName,
		Phone:    req.Phone,
		Email:    req.Email,
		Role:     model.RoleAdmin,
		Status:   model.StatusNormal,
	}

	if err := model.DB.Create(&adminUser).Error; err != nil {
		response.ErrorServer(c)
		return
	}

	response.Success(c, gin.H{
		"id":       adminUser.ID,
		"username": adminUser.Username,
	})
}

// GetInfo returns the current admin user's information from the JWT context.
// GET /api/v1/auth/info [JWTAuth]
func GetInfo(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.ErrorUnauthorized(c)
		return
	}

	var adminUser model.AdminUser
	if err := model.DB.First(&adminUser, userID).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, response.ErrorCode(response.CodeUserNotFound))
		return
	}

	response.Success(c, gin.H{
		"id":        adminUser.ID,
		"username":  adminUser.Username,
		"real_name": adminUser.RealName,
		"phone":     adminUser.Phone,
		"email":     adminUser.Email,
		"avatar":    adminUser.Avatar,
		"role":      adminUser.Role,
		"status":    adminUser.Status,
	})
}

// ChangePassword allows an admin user to change their password.
// PUT /api/v1/auth/password [JWTAuth]
// Body: {"old_password": "...", "new_password": "..."}
func ChangePassword(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.ErrorUnauthorized(c)
		return
	}

	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "请填写正确的密码信息")
		return
	}

	var adminUser model.AdminUser
	if err := model.DB.First(&adminUser, userID).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, response.ErrorCode(response.CodeUserNotFound))
		return
	}

	// Verify old password
	if err := bcrypt.CompareHashAndPassword([]byte(adminUser.Password), []byte(req.OldPassword)); err != nil {
		response.Error(c, response.CodeLoginFailed, "原密码错误")
		return
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		response.ErrorServer(c)
		return
	}

	// Update password
	if err := model.DB.Model(&adminUser).Update("password", string(hashedPassword)).Error; err != nil {
		response.ErrorServer(c)
		return
	}

	response.Success(c, nil)
}
