package model

import (
	"time"
)

// AgentList agent / regional agent list (地区代理)
type AgentList struct {
	BaseModel
	UserTel   string     `json:"usertel" gorm:"size:20;uniqueIndex;not null"`
	Password  string     `json:"-" gorm:"size:256;not null"`
	Contact   string     `json:"contact" gorm:"size:50"`
	Telephone string     `json:"telephone" gorm:"size:20"`
	CityID    uint       `json:"city_id" gorm:"index;comment:城市ID"`
	Area      string     `json:"area" gorm:"size:100"`
	Address   string     `json:"address" gorm:"size:200"`
	Status    int        `json:"status" gorm:"default:1;comment:0禁用 1等待审核 2审核通过"`
	Title     string     `json:"title" gorm:"size:100"`
	Uno       string     `json:"uno" gorm:"size:50;comment:统一社会信用代码"`
	Photo     string     `json:"photo" gorm:"size:255"`
	Sms       string     `json:"sms" gorm:"size:20"`
	Display   int        `json:"display" gorm:"default:0;comment:0隐藏 1显示"`
	Info      string     `json:"info" gorm:"type:text"`
	RegTime   *time.Time `json:"regtime" gorm:"type:datetime;comment:注册时间"`
	Sort      int        `json:"sort" gorm:"default:0"`

	// Foreign key relations
	City WebCity `json:"city,omitempty" gorm:"foreignKey:CityID"`
}

func (AgentList) TableName() string {
	return "agent_list"
}

// Agent status constants
const (
	AgentStatusDisabled  = 0 // 禁用
	AgentStatusPending   = 1 // 等待审核
	AgentStatusApproved  = 2 // 审核通过
)

// PartnerList partner / merchant list (商家/门店)
type PartnerList struct {
	BaseModel
	Username  string     `json:"username" gorm:"size:50;not null"`
	Contact   string     `json:"contact" gorm:"size:50"`
	UserTel   string     `json:"usertel" gorm:"size:20;uniqueIndex;not null"`
	Password  string     `json:"-" gorm:"size:256;not null"`
	Company   string     `json:"company" gorm:"size:200"`
	CityID    uint       `json:"city_id" gorm:"index;comment:城市ID"`
	Role      int        `json:"role" gorm:"default:2;comment:2商家 3门店"`
	PartnerID uint       `json:"partner_id" gorm:"index;comment:上级商家ID"`
	Address   string     `json:"address" gorm:"size:200"`
	Status    int        `json:"status" gorm:"default:1;comment:0禁用 1正常"`
	Ratio     float64    `json:"ratio" gorm:"type:decimal(5,2);default:0;comment:分成比例"`
	Licence   string     `json:"licence" gorm:"size:200"`
	LicPic    string     `json:"lic_pic" gorm:"size:255"`
	Discount  float64    `json:"discount" gorm:"type:decimal(5,2);default:100;comment:折扣"`
	IDCard    string     `json:"id_card" gorm:"size:20"`
	IDPic1    string     `json:"id_pic1" gorm:"size:255"`
	IDPic2    string     `json:"id_pic2" gorm:"size:255"`
	Info      string     `json:"info" gorm:"type:text"`
	RegTime   *time.Time `json:"regtime" gorm:"type:datetime;comment:注册时间"`

	// Foreign key relations
	City    WebCity     `json:"city,omitempty" gorm:"foreignKey:CityID"`
	Partner *PartnerList `json:"partner,omitempty" gorm:"foreignKey:PartnerID"`
}

func (PartnerList) TableName() string {
	return "partner_list"
}

// Partner role constants
const (
	PartnerRoleMerchant = 2 // 商家
	PartnerRoleStore    = 3 // 门店
)

// Partner status constants
const (
	PartnerStatusDisabled = 0 // 禁用
	PartnerStatusNormal   = 1 // 正常
)

// PartnerKey partner key management (商家密钥)
type PartnerKey struct {
	BaseModel
	Title    string `json:"title" gorm:"size:100"`
	Username string `json:"username" gorm:"size:50"`
	UserTel  string `json:"usertel" gorm:"size:20"`
	Key      string `json:"key" gorm:"size:100"`
	Status   int    `json:"status" gorm:"default:1;comment:0禁用 1正常"`
}

func (PartnerKey) TableName() string {
	return "partner_key"
}

// WholeSale wholesale / distribution purchase and batch recovery (分销采购/批量回收)
type WholeSale struct {
	BaseModel
	Type     int        `json:"type" gorm:"default:1;comment:1分销采购 2批量回收"`
	Username string     `json:"username" gorm:"size:50;not null"`
	UserTel  string     `json:"usertel" gorm:"size:20;not null"`
	Company  string     `json:"company" gorm:"size:200"`
	Address  string     `json:"address" gorm:"size:200"`
	Info     string     `json:"info" gorm:"type:text"`
	Mark     string     `json:"mark" gorm:"size:500"`
	AddTime  *time.Time `json:"addtime" gorm:"type:datetime;comment:添加时间"`
}

func (WholeSale) TableName() string {
	return "partner_wholesale"
}

// WholeSale type constants
const (
	WholeSaleTypeDistribution = 1 // 分销采购
	WholeSaleTypeRecycle      = 2 // 批量回收
)

// JoinIn join-in application (代理加盟申请)
type JoinIn struct {
	BaseModel
	Type     int        `json:"type" gorm:"default:1;comment:1地区代理 2校园代理"`
	Username string     `json:"username" gorm:"size:50;not null"`
	UserTel  string     `json:"usertel" gorm:"size:20;not null"`
	QQ       string     `json:"qq" gorm:"size:20"`
	Address  string     `json:"address" gorm:"size:200"`
	Info     string     `json:"info" gorm:"type:text"`
	Mark     string     `json:"mark" gorm:"size:500"`
	AddTime  *time.Time `json:"addtime" gorm:"type:datetime;comment:添加时间"`
}

func (JoinIn) TableName() string {
	return "partner_joinin"
}

// JoinIn type constants
const (
	JoinInTypeRegionalAgent = 1 // 地区代理
	JoinInTypeCampusAgent   = 2 // 校园代理
)

// PartnerStore partner store management (合作门店)
type PartnerStore struct {
	BaseModel
	Username  string     `json:"username" gorm:"size:50;not null"`
	UserTel   string     `json:"usertel" gorm:"size:20;not null"`
	StoreName string     `json:"storename" gorm:"size:200;not null"`
	Address   string     `json:"address" gorm:"size:200"`
	SrvTime   string     `json:"srvtime" gorm:"size:100;comment:营业时间"`
	Discount  float64    `json:"discount" gorm:"type:decimal(5,2);default:100;comment:折扣"`
	CityID    uint       `json:"city_id" gorm:"index;comment:城市ID"`
	Info      string     `json:"info" gorm:"type:text"`
	AddTime   *time.Time `json:"addtime" gorm:"type:datetime;comment:添加时间"`
	Photo     string     `json:"photo" gorm:"size:255"`
	Status    int        `json:"status" gorm:"default:1;comment:0禁用 1正常"`

	// Foreign key relations
	City WebCity `json:"city,omitempty" gorm:"foreignKey:CityID"`
}

func (PartnerStore) TableName() string {
	return "partner_store"
}

// PadManage pad / terminal management (终端管理)
type PadManage struct {
	BaseModel
	Username  string     `json:"username" gorm:"size:50;not null"`
	UserTel   string     `json:"usertel" gorm:"size:20;not null"`
	StoreName string     `json:"storename" gorm:"size:200"`
	Address   string     `json:"address" gorm:"size:200"`
	Discount  float64    `json:"discount" gorm:"type:decimal(5,2);default:100;comment:折扣"`
	PadNo     string     `json:"padno" gorm:"size:50;comment:终端编号"`
	Info      string     `json:"info" gorm:"type:text"`
	AddTime   *time.Time `json:"addtime" gorm:"type:datetime;comment:添加时间"`
}

func (PadManage) TableName() string {
	return "pad_manager"
}

// SubWebsite sub-website / white-label site (子站管理)
type SubWebsite struct {
	BaseModel
	Title    string `json:"title" gorm:"size:100"`
	Username string `json:"username" gorm:"size:50"`
	UserTel  string `json:"usertel" gorm:"size:20"`
	Ratio    float64 `json:"ratio" gorm:"type:decimal(5,2);default:0;comment:分成比例"`
	Key      string `json:"key" gorm:"size:100;comment:站点标识"`
	Status   int    `json:"status" gorm:"default:1;comment:0禁用 1正常"`
}

func (SubWebsite) TableName() string {
	return "sub_website"
}
