package model

import (
	"time"
)

// SaleLevel sale level definition (分销等级)
type SaleLevel struct {
	BaseModel
	Name string `json:"name" gorm:"size:100;not null"`
	Info string `json:"info" gorm:"size:500"`
}

func (SaleLevel) TableName() string {
	return "sale_level"
}

// SaleGoods sale goods / auction items (竞价商品)
type SaleGoods struct {
	BaseModel
	BrandID     uint   `json:"brand_id" gorm:"index;comment:品牌ID"`
	Productname string `json:"productname" gorm:"size:200;not null"`
	Amount      int    `json:"amount" gorm:"default:0;comment:数量"`
	LevelID     uint   `json:"level_id" gorm:"index;comment:等级ID"`
	Desc        string `json:"desc" gorm:"size:500"`
	AddTime     *time.Time `json:"addtime" gorm:"type:datetime"`
	Status      int    `json:"status" gorm:"default:1;comment:0下架 1竞价"`
	Info        string `json:"info" gorm:"type:text"`

	// Foreign key relations
	Brand ProductBrands `json:"brand,omitempty" gorm:"foreignKey:BrandID"`
	Level SaleLevel     `json:"level,omitempty" gorm:"foreignKey:LevelID"`
}

func (SaleGoods) TableName() string {
	return "sale_goods"
}

// SaleUsers sale / distribution users (分销用户)
type SaleUsers struct {
	BaseModel
	Company    string `json:"company" gorm:"size:200"`
	Username   string `json:"username" gorm:"size:50;uniqueIndex;not null"`
	Password   string `json:"-" gorm:"size:256;not null"`
	Contact    string `json:"contact" gorm:"size:50"`
	UserTel    string `json:"usertel" gorm:"size:20"`
	City       string `json:"city" gorm:"size:50"`
	Address    string `json:"address" gorm:"size:200"`
	License    string `json:"license" gorm:"size:200"`
	LicPic     string `json:"lic_pic" gorm:"size:255"`
	Info       string `json:"info" gorm:"type:text"`
	Bank       string `json:"bank" gorm:"size:100"`
	BName      string `json:"bname" gorm:"size:100"`
	BNum       string `json:"bnum" gorm:"size:50"`
	Status     int    `json:"status" gorm:"default:0;comment:0正常 1禁用"`
	Deposit    int    `json:"deposit" gorm:"default:0;comment:保证金"`
	Validity   *time.Time `json:"validity" gorm:"type:datetime;comment:有效期"`
	IDCard     string `json:"idcard" gorm:"size:20"`
	IDCardPic1 string `json:"idcard_pic1" gorm:"size:255"`
	IDCardPic2 string `json:"idcard_pic2" gorm:"size:255"`
}

func (SaleUsers) TableName() string {
	return "sale_user"
}

// SaleOrders sale auction orders (竞价订单)
type SaleOrders struct {
	BaseModel
	GoodsID   uint       `json:"goods_id" gorm:"index;comment:商品ID"`
	UserID    uint       `json:"user_id" gorm:"index;comment:用户ID"`
	RAmount   int        `json:"r_amount" gorm:"default:0;comment:需求数量"`
	SAmount   int        `json:"s_amount" gorm:"default:0;comment:供应数量"`
	Price     float64    `json:"price" gorm:"type:decimal(10,2);default:0;comment:单价"`
	AddTime   *time.Time `json:"addtime" gorm:"type:datetime;comment:下单时间"`
	Status    int        `json:"status" gorm:"default:0;comment:0待确认 1已确认 2已发货 3已收货 4已付款 5已完成 6已取消 7已拒绝 8退款中 9已退款"`
	Info      string     `json:"info" gorm:"type:text"`
	ExpressID uint       `json:"express_id" gorm:"index;comment:物流公司ID"`
	ExpressNo string     `json:"express_no" gorm:"size:50"`
	UpdateTime *time.Time `json:"updatetime" gorm:"type:datetime;comment:更新时间"`

	// Foreign key relations
	Goods  SaleGoods  `json:"goods,omitempty" gorm:"foreignKey:GoodsID"`
	User   SaleUsers  `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Express WebExpress `json:"express,omitempty" gorm:"foreignKey:ExpressID"`
}

func (SaleOrders) TableName() string {
	return "sale_order"
}

// Sale order status constants
const (
	SaleOrderStatusPending    = 0 // 待确认
	SaleOrderStatusConfirmed  = 1 // 已确认
	SaleOrderStatusShipped    = 2 // 已发货
	SaleOrderStatusReceived   = 3 // 已收货
	SaleOrderStatusPaid       = 4 // 已付款
	SaleOrderStatusCompleted  = 5 // 已完成
	SaleOrderStatusCancelled  = 6 // 已取消
	SaleOrderStatusRejected   = 7 // 已拒绝
	SaleOrderStatusRefunding  = 8 // 退款中
	SaleOrderStatusRefunded   = 9 // 已退款
)

// Sale goods status constants
const (
	SaleGoodsStatusOffShelf = 0 // 下架
	SaleGoodsStatusAuction  = 1 // 竞价中
)

// Sale user status constants
const (
	SaleUserStatusNormal   = 0 // 正常
	SaleUserStatusDisabled = 1 // 禁用
)
