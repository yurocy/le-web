package model

import (
	"time"
)

// ============================================================
// News related models (article app)
// ============================================================

// NewsCategory news category classification
type NewsCategory struct {
	BaseModel
	Classname string `json:"classname" gorm:"size:100;not null;comment:分类名称"`
	Info      string `json:"info" gorm:"size:500;comment:分类描述"`
}

func (NewsCategory) TableName() string {
	return "news_category"
}

// NewsArticle news article / content
type NewsArticle struct {
	BaseModel
	Title     string     `json:"title" gorm:"size:200;not null;comment:文章标题"`
	Info      string     `json:"info" gorm:"size:500;comment:文章摘要"`
	CategoryID uint      `json:"category_id" gorm:"index;not null;comment:所属分类ID"`
	Category  NewsCategory `json:"category" gorm:"foreignKey:CategoryID"`
	Ishot     int        `json:"ishot" gorm:"default:0;comment:是否热门 0否 1是"`
	Keyword   string     `json:"keyword" gorm:"size:255;comment:SEO关键词"`
	Content   string     `json:"content" gorm:"type:longtext;comment:文章内容(HTML)"`
	Date      *time.Time `json:"date" gorm:"comment:发布日期"`
}

func (NewsArticle) TableName() string {
	return "news_article"
}

// Comment type constants
const (
	CommentTypeOrder = 0 // 订单评论
	CommentTypeAgent = 1 // 代理评论
)

// Comment user comment (orders / agents)
type Comment struct {
	BaseModel
	Type    int    `json:"type" gorm:"default:0;not null;comment:评论类型 0订单 1代理"`
	Mark    int    `json:"mark" gorm:"default:5;not null;comment:评分 1-5星"`
	OrderID uint   `json:"order_id" gorm:"index;comment:关联订单ID"`
	AgentID uint   `json:"agent_id" gorm:"index;comment:关联代理ID"`
	Content string `json:"content" gorm:"size:1000;not null;comment:评论内容"`
	IP      string `json:"ip" gorm:"size:50;comment:评论者IP"`
	Addtime *time.Time `json:"addtime" gorm:"comment:评论时间"`
	UserTel string `json:"usertel" gorm:"size:20;comment:评论者手机号"`
}

func (Comment) TableName() string {
	return "web_comment"
}
