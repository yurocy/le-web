package model

import (
	"time"
)

// BaseModel common base model with ID and timestamps
type BaseModel struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// Status constants
const (
	StatusDisabled  = 0
	StatusPending   = 1
	StatusApproved  = 2
	StatusNormal    = 1
	StatusAbnormal  = 0
)

// Flag constants
const (
	FlagNo  = 0
	FlagYes = 1
)

// User role constants (unified user system)
const (
	RoleMember      = 0  // 前台会员
	RoleAgent       = 1  // 地区代理
	RolePartner     = 2  // 商家
	RoleStore       = 3  // 门店
	RolePricingUser = 99 // 报价用户
	RoleSaleUser    = 100 // 分销用户
	RoleAdmin       = 999 // 后台管理员
	RoleSuperAdmin  = 1000 // 超级管理员
)

// AdminUser unified admin user model (replaces separate admin tables)
type AdminUser struct {
	BaseModel
	Username string `json:"username" gorm:"size:50;uniqueIndex;not null"`
	Password string `json:"-" gorm:"size:256;not null"`
	RealName string `json:"real_name" gorm:"size:50"`
	Phone    string `json:"phone" gorm:"size:20;uniqueIndex"`
	Email    string `json:"email" gorm:"size:100"`
	Avatar   string `json:"avatar" gorm:"size:255"`
	Role     int    `json:"role" gorm:"default:999;not null;comment:角色 999管理员 1000超级管理员"`
	Status   int    `json:"status" gorm:"default:1;comment:0禁用 1正常"`
}

func (AdminUser) TableName() string {
	return "admin_user"
}

// Role role-based access control model
type Role struct {
	BaseModel
	RoleName string `json:"role_name" gorm:"size:50;uniqueIndex;not null"`
	RoleKey  string `json:"role_key" gorm:"size:50;uniqueIndex;not null"`
	Sort     int    `json:"sort" gorm:"default:100"`
	Status   int    `json:"status" gorm:"default:1"`
	Desc     string `json:"desc" gorm:"size:200"`
}

func (Role) TableName() string {
	return "sys_role"
}

// Menu system menu definition
type Menu struct {
	BaseModel
	ParentID uint   `json:"parent_id" gorm:"default:0;index"`
	Name     string `json:"name" gorm:"size:50;not null"`
	Path     string `json:"path" gorm:"size:200"`
	Icon     string `json:"icon" gorm:"size:100"`
	Sort     int    `json:"sort" gorm:"default:100"`
	Type     int    `json:"type" gorm:"default:1;comment:1菜单 2按钮"`
	Perm     string `json:"perm" gorm:"size:100;comment:权限标识"`
	Hidden   int    `json:"hidden" gorm:"default:0"`
	Status   int    `json:"status" gorm:"default:1"`
}

func (Menu) TableName() string {
	return "sys_menu"
}

// UserRole user-role association
type UserRole struct {
	UserID uint `json:"user_id" gorm:"primaryKey"`
	RoleID uint `json:"role_id" gorm:"primaryKey"`
}

func (UserRole) TableName() string {
	return "sys_user_role"
}

// RoleMenu role-menu association
type RoleMenu struct {
	RoleID uint `json:"role_id" gorm:"primaryKey"`
	MenuID uint `json:"menu_id" gorm:"primaryKey"`
}

func (RoleMenu) TableName() string {
	return "sys_role_menu"
}

// OperationLog operation audit log
type OperationLog struct {
	BaseModel
	UserID   uint   `json:"user_id" gorm:"index"`
	Username string `json:"username" gorm:"size:50"`
	Method   string `json:"method" gorm:"size:10"`
	Path     string `json:"path" gorm:"size:200"`
	IP       string `json:"ip" gorm:"size:50"`
	Body     string `json:"body" gorm:"type:text"`
	Result   int    `json:"result" gorm:"default:0"`
	Remark   string `json:"remark" gorm:"size:500"`
}

func (OperationLog) TableName() string {
	return "sys_operation_log"
}
