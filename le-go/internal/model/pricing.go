package model

import (
	"time"
)

// Pricing module constants
const (
	PricingStatusHidden = 0 // 隐藏
	PricingStatusShow   = 1 // 展示

	PricingUserStatusPending  = 0 // 未审核
	PricingUserStatusApproved = 1 // 审核通过
	PricingUserStatusDisabled = 2 // 禁用
)

// PricingCategory 报价分类
type PricingCategory struct {
	BaseModel
	Name   string `json:"name" gorm:"size:100;not null"`
	Sort   int    `json:"sort" gorm:"default:0"`
	Status int    `json:"status" gorm:"default:1;comment:0隐藏 1展示"`
	Icon   string `json:"icon" gorm:"size:255"`
}

func (PricingCategory) TableName() string {
	return "pricing_category"
}

// PriceBrand 报价品牌
type PriceBrand struct {
	BaseModel
	Name  string `json:"name" gorm:"size:100;not null"`
	Image string `json:"image" gorm:"size:255"`
	Sort  int    `json:"sort" gorm:"default:0"`
	Cid   int    `json:"cid" gorm:"index;comment:分类ID"`
}

func (PriceBrand) TableName() string {
	return "pricing_brands"
}

// PricingUser 报价用户
type PricingUser struct {
	BaseModel
	UserTel  string     `json:"user_tel" gorm:"size:20;uniqueIndex;not null;comment:手机号"`
	Username string     `json:"username" gorm:"size:100;not null;comment:用户名"`
	Password string     `json:"-" gorm:"size:256;not null;comment:密码"`
	Address  string     `json:"address" gorm:"size:255;comment:地址"`
	Status   int        `json:"status" gorm:"default:0;comment:0未审核 1审核通过 2禁用"`
	RegTime  *time.Time `json:"reg_time" gorm:"comment:注册时间"`
	Company  string     `json:"company" gorm:"size:200;comment:公司名称"`
	Owner    string     `json:"owner" gorm:"size:50;comment:联系人"`
	IdCard   string     `json:"id_card" gorm:"size:50;comment:身份证号"`
	IdPic    string     `json:"id_pic" gorm:"size:255;comment:身份证照片"`
}

func (PricingUser) TableName() string {
	return "pricing_user"
}

// Pricing 报价信息
type Pricing struct {
	BaseModel
	Title      string     `json:"title" gorm:"size:200;not null;comment:标题"`
	Info       string     `json:"info" gorm:"type:text;comment:详情"`
	AddTime    *time.Time `json:"add_time" gorm:"comment:添加时间"`
	CategoryID uint       `json:"category_id" gorm:"index;comment:分类ID"`
	BrandID    uint       `json:"brand_id" gorm:"index;comment:品牌ID"`
	Image      string     `json:"image" gorm:"size:255;comment:封面图"`
	PriceFile  string     `json:"price_file" gorm:"size:255;comment:报价单文件"`

	// Relations
	Category *PricingCategory `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Brand    *PriceBrand      `json:"brand,omitempty" gorm:"foreignKey:BrandID"`
}

func (Pricing) TableName() string {
	return "pricing_article"
}

// PricingIndexPic 报价首页轮播图
type PricingIndexPic struct {
	BaseModel
	Title string `json:"title" gorm:"size:200;not null;comment:标题"`
	URL   string `json:"url" gorm:"size:500;comment:链接地址"`
	Path  string `json:"path" gorm:"size:255;comment:图片路径"`
	Type  int    `json:"type" gorm:"default:1;comment:0隐藏 1显示"`
	Sort  int    `json:"sort" gorm:"default:0;comment:排序"`
}

func (PricingIndexPic) TableName() string {
	return "pricing_indexpic"
}
