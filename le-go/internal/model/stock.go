package model

import (
	"time"
)

// =====================================================================
// Stock admin role constants
// =====================================================================

const (
	StockRoleRegister = 0 // 登记
	StockRoleAdmin    = 1 // 管理员
)

// =====================================================================
// StockAdmin 库存管理员
// =====================================================================

type StockAdmin struct {
	BaseModel
	Name     string `json:"name" gorm:"size:50;not null;comment:姓名"`
	UserTel  string `json:"user_tel" gorm:"size:20;not null;comment:手机号"`
	Password string `json:"-" gorm:"size:256;not null;comment:密码"`
	Role     int    `json:"role" gorm:"default:0;comment:0登记 1管理员"`
}

func (StockAdmin) TableName() string {
	return "stock_admin"
}

// =====================================================================
// StockUser 库存客户
// =====================================================================

type StockUser struct {
	BaseModel
	Name    string `json:"name" gorm:"size:50;not null;comment:姓名"`
	Contact string `json:"contact" gorm:"size:50;comment:联系人"`
	UserTel string `json:"user_tel" gorm:"size:20;comment:手机号"`
	Info    string `json:"info" gorm:"type:text;comment:备注"`
	CityID  *uint  `json:"city_id" gorm:"index;comment:城市ID"`
}

func (StockUser) TableName() string {
	return "stock_user"
}

// =====================================================================
// StockGoods 库存商品
// =====================================================================

type StockGoods struct {
	BaseModel
	Addtime     *time.Time `json:"addtime" gorm:"comment:入库时间"`
	ExpCom      string     `json:"exp_com" gorm:"size:50;comment:快递公司"`
	ExpOrder    string     `json:"exp_order" gorm:"size:50;comment:快递单号"`
	ExpFee      float64    `json:"exp_fee" gorm:"type:decimal(10,2);default:0;comment:快递费"`
	ExpSafe     float64    `json:"exp_safe" gorm:"type:decimal(10,2);default:0;comment:保价费"`
	ExpPay      float64    `json:"exp_pay" gorm:"type:decimal(10,2);default:0;comment:快递实付"`
	AgentID     *uint      `json:"agent_id" gorm:"index;comment:代理ID"`
	Number      string     `json:"number" gorm:"size:50;comment:数量"`
	ProductName string     `json:"product_name" gorm:"size:200;comment:产品名称"`
	IMEI        string     `json:"imei" gorm:"size:50;comment:IMEI"`
	Desc        string     `json:"desc" gorm:"type:text;comment:描述"`
	AssPrice    float64    `json:"ass_price" gorm:"type:decimal(10,2);default:0;comment:评估价"`
	CheckPrice  float64    `json:"check_price" gorm:"type:decimal(10,2);default:0;comment:验收价"`
	Repay       float64    `json:"repay" gorm:"type:decimal(10,2);default:0;comment:还款金额"`
	LastPrice   float64    `json:"last_price" gorm:"type:decimal(10,2);default:0;comment:最终价格"`
	Activity    string     `json:"activity" gorm:"size:100;comment:活动"`
	AllPay      float64    `json:"all_pay" gorm:"type:decimal(10,2);default:0;comment:总支出"`
	Dues        float64    `json:"dues" gorm:"type:decimal(10,2);default:0;comment:应付"`
	Pay         float64    `json:"pay" gorm:"type:decimal(10,2);default:0;comment:实付"`
	OutPrice    float64    `json:"out_price" gorm:"type:decimal(10,2);default:0;comment:出货价"`
	Profit      float64    `json:"profit" gorm:"type:decimal(10,2);default:0;comment:利润"`
	Info        string     `json:"info" gorm:"type:text;comment:备注"`
	SaleTime    *time.Time `json:"sale_time" gorm:"comment:售出时间"`
}

func (StockGoods) TableName() string {
	return "stock_goods"
}
