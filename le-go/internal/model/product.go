package model

import (
	"time"

	"gorm.io/gorm"
)

// =====================================================================
// Product Order method constants
// =====================================================================

// ProductOrder method: 0=邮寄 1=上门 2=到店
const (
	ProductOrderMethodMail    = 0 // 邮寄
	ProductOrderMethodVisit   = 1 // 上门
	ProductOrderMethodInStore = 2 // 到店
)

// DescTitle type: 1=单选 2=多选
const (
	DescTitleTypeSingle = 1 // 单选
	DescTitleTypeMulti  = 2 // 多选
)

// =====================================================================
// ProductCategory 产品分类
// =====================================================================

type ProductCategory struct {
	BaseModel
	Name  string `json:"name" gorm:"size:100;not null;comment:分类名称"`
	Image string `json:"image" gorm:"size:255;comment:分类图片"`
	Sort  int    `json:"sort" gorm:"default:0;comment:排序"`
}

func (ProductCategory) TableName() string {
	return "product_category"
}

// =====================================================================
// ProductBrands 产品品牌
// =====================================================================

type ProductBrands struct {
	BaseModel
	TypeID uint   `json:"type_id" gorm:"not null;index;comment:分类ID"`
	Name   string `json:"name" gorm:"size:100;not null;comment:品牌名称"`
	Image  string `json:"image" gorm:"size:255;comment:品牌图片"`
	Sort   int    `json:"sort" gorm:"default:0;comment:排序"`
	Ishot  int    `json:"ishot" gorm:"default:0;comment:0否 1热门"`
	Onsale int    `json:"onsale" gorm:"default:0;comment:0下架 1上架"`
}

func (ProductBrands) TableName() string {
	return "product_brands"
}

// =====================================================================
// DescList 描述包列表
// =====================================================================

type DescList struct {
	BaseModel
	Name string `json:"name" gorm:"size:100;not null;comment:描述包名称"`
}

func (DescList) TableName() string {
	return "desc_list"
}

// HasDescriptions checks whether this description pack is used by any product.
func (d *DescList) HasDescriptions(db *gorm.DB) bool {
	var count int64
	db.Model(&ProductList{}).Where("desc_id = ?", d.ID).Limit(1).Count(&count)
	return count > 0
}

// =====================================================================
// DescTitle 描述标题
// =====================================================================

type DescTitle struct {
	BaseModel
	DescID uint   `json:"desc_id" gorm:"not null;index;comment:描述包ID"`
	Type   int    `json:"type" gorm:"default:1;comment:1单选 2多选"`
	Title  string `json:"title" gorm:"size:100;not null;comment:标题"`
	Sort   int    `json:"sort" gorm:"default:0;comment:排序"`
}

func (DescTitle) TableName() string {
	return "desc_title"
}

// =====================================================================
// DescImage 描述图片
// =====================================================================

type DescImage struct {
	BaseModel
	Name     string `json:"name" gorm:"size:100;not null;comment:图片名称"`
	Image    string `json:"image" gorm:"size:255;comment:图片地址"`
	TextInfo string `json:"text_info" gorm:"type:text;comment:文字说明"`
}

func (DescImage) TableName() string {
	return "desc_image"
}

// =====================================================================
// DescOption 描述选项
// =====================================================================

type DescOption struct {
	BaseModel
	TitleID uint    `json:"title_id" gorm:"not null;index;comment:描述标题ID"`
	Text    string  `json:"text" gorm:"size:100;not null;comment:选项文本"`
	Info    string  `json:"info" gorm:"size:255;comment:选项说明"`
	ImageID *uint   `json:"image_id" gorm:"index;comment:关联图片ID(可为空)"`
	Sort    int     `json:"sort" gorm:"default:0;comment:排序"`
	Ratio   float64 `json:"ratio" gorm:"type:decimal(5,2);default:0;comment:比例"`
}

func (DescOption) TableName() string {
	return "desc_option"
}

// =====================================================================
// ProductList 产品列表
// =====================================================================

type ProductList struct {
	BaseModel
	ProductName string  `json:"product_name" gorm:"size:200;not null;comment:产品名称"`
	Model       string  `json:"model" gorm:"size:100;comment:型号"`
	DescID      *uint   `json:"desc_id" gorm:"index;comment:描述包ID"`
	BrandID     *uint   `json:"brand_id" gorm:"index;comment:品牌ID"`
	ProductPrice float64 `json:"product_price" gorm:"type:decimal(10,2);default:0;comment:产品价格"`
	LowestPrice  float64 `json:"lowest_price" gorm:"type:decimal(10,2);default:0;comment:最低价格"`
	NewPrice     float64 `json:"new_price" gorm:"type:decimal(10,2);default:0;comment:新机价格"`
	ProductImg   string  `json:"product_img" gorm:"size:255;comment:产品图片"`
	Price7       float64 `json:"price7" gorm:"type:decimal(10,2);default:0;comment:7天价格"`
	Ishot        int     `json:"ishot" gorm:"default:0;comment:0否 1热门"`
	Display      int     `json:"display" gorm:"default:1;comment:0隐藏 1显示"`
	Sort         int     `json:"sort" gorm:"default:0;comment:排序"`
	Success      int     `json:"success" gorm:"default:0;comment:成交次数"`
	SearchText   string  `json:"search_text" gorm:"type:text;comment:搜索关键词"`
}

func (ProductList) TableName() string {
	return "product_list"
}

// =====================================================================
// ProductOrder 产品订单
// =====================================================================

type ProductOrder struct {
	BaseModel
	OrderID     string     `json:"order_id" gorm:"size:50;uniqueIndex;not null;comment:订单编号"`
	UserID      *uint      `json:"user_id" gorm:"index;comment:用户ID"`
	Method      int        `json:"method" gorm:"default:0;comment:0邮寄 1上门 2到店"`
	Referee     string     `json:"referee" gorm:"size:50;comment:推荐人"`
	AssessPrice float64    `json:"assess_price" gorm:"type:decimal(10,2);default:0;comment:评估价"`
	ActualPrice float64    `json:"actual_price" gorm:"type:decimal(10,2);default:0;comment:实际价格"`
	ApplyPrice  float64    `json:"apply_price" gorm:"type:decimal(10,2);default:0;comment:申请价格"`
	ProductID   *uint      `json:"product_id" gorm:"index;comment:产品ID"`
	Status      int        `json:"status" gorm:"default:0;comment:订单状态0-10"`
	ExpComID    *uint      `json:"exp_com_id" gorm:"index;comment:快递公司ID"`
	ExpOrder    string     `json:"exp_order" gorm:"size:50;comment:快递单号"`
	ExpFee      float64    `json:"exp_fee" gorm:"type:decimal(10,2);default:0;comment:快递费"`
	ExpPay      float64    `json:"exp_pay" gorm:"type:decimal(10,2);default:0;comment:快递实付"`
	CityID      *uint      `json:"city_id" gorm:"index;comment:城市ID"`
	CountyID    *uint      `json:"county_id" gorm:"index;comment:区县ID"`
	Atime       *time.Time `json:"atime" gorm:"comment:预约时间"`
	DescText    string     `json:"desc_text" gorm:"type:text;comment:描述文本"`
	ActualDesc  string     `json:"actual_desc" gorm:"type:text;comment:实际描述"`
	Ticket      string     `json:"ticket" gorm:"size:255;comment:凭证"`
	PartnerID   *uint      `json:"partner_id" gorm:"index;comment:合作商ID"`
	Source      string     `json:"source" gorm:"size:50;comment:来源"`
	IMEI        string     `json:"imei" gorm:"size:50;comment:IMEI"`
	Number      string     `json:"number" gorm:"size:50;comment:数量"`
	Evaluate    string     `json:"evaluate" gorm:"type:text;comment:评价"`
	Info        string     `json:"info" gorm:"type:text;comment:备注信息"`
	IsProblem   int        `json:"is_problem" gorm:"default:0;comment:0正常 1有异议"`
	IsReported  int        `json:"is_reported" gorm:"default:0;comment:0否 1已举报"`
	SendSms     int        `json:"send_sms" gorm:"default:0;comment:0未发 1已发短信"`
	StoreID     *uint      `json:"store_id" gorm:"index;comment:门店ID"`
	ExpOn       int        `json:"exp_on" gorm:"default:0;comment:0未发货 1已发货"`
	Tester      string     `json:"tester" gorm:"size:50;comment:检测人"`
	SubwebID    *uint      `json:"subweb_id" gorm:"index;comment:子站ID"`
	Coupon      string     `json:"coupon" gorm:"size:100;comment:优惠券"`
	Image1      string     `json:"image1" gorm:"size:255;comment:图片1"`
	Image2      string     `json:"image2" gorm:"size:255;comment:图片2"`
	Image3      string     `json:"image3" gorm:"size:255;comment:图片3"`
	Image4      string     `json:"image4" gorm:"size:255;comment:图片4"`
	UserDel     int        `json:"user_del" gorm:"default:0;comment:0正常 1用户删除"`
}

func (ProductOrder) TableName() string {
	return "product_order"
}

// =====================================================================
// Coupon 优惠券
// =====================================================================

type Coupon struct {
	BaseModel
	Title   string     `json:"title" gorm:"size:100;not null;comment:优惠券标题"`
	Price   float64    `json:"price" gorm:"type:decimal(10,2);default:0;comment:优惠金额"`
	Limit   float64    `json:"limit" gorm:"type:decimal(10,2);default:0;comment:使用门槛"`
	Outtime *time.Time `json:"outtime" gorm:"comment:过期时间"`
	Info    string     `json:"info" gorm:"size:255;comment:使用说明"`
	Sort    int        `json:"sort" gorm:"default:0;comment:排序"`
	Status  int        `json:"status" gorm:"default:1;comment:0禁用 1启用"`
}

func (Coupon) TableName() string {
	return "coupon"
}

// =====================================================================
// UserCoupon 用户优惠券
// =====================================================================

type UserCoupon struct {
	BaseModel
	CouponID uint       `json:"coupon_id" gorm:"not null;index;comment:优惠券ID"`
	UserTel  string     `json:"user_tel" gorm:"size:20;not null;comment:用户手机号"`
	Addtime  *time.Time `json:"addtime" gorm:"comment:领取时间"`
}

func (UserCoupon) TableName() string {
	return "user_coupon"
}
