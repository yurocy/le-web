package model

import (
        "time"
)

// Bidding module constants
const (
        BiddingStatusHidden = 0 // 隐藏
        BiddingStatusShow   = 1 // 展示

        BiddingUserStatusPending  = 0 // 未审核
        BiddingUserStatusApproved = 1 // 审核通过
        BiddingUserStatusDisabled = 2 // 禁用

        BiddingProductStatusOff     = 0 // 下架
        BiddingProductStatusOn      = 1 // 上架
        BiddingProductStatusBanned  = 2 // 禁用

        BiddingProductGradeS = 1 // S级
        BiddingProductGradeA = 2 // A级
        BiddingProductGradeB = 3 // B级

        BiddingOrderStatusNew        = 0 // 新订单
        BiddingOrderStatusPaid       = 1 // 已付款
        BiddingOrderStatusShipped    = 2 // 已发货
        BiddingOrderStatusReceived   = 3 // 已收货
        BiddingOrderStatusCompleted  = 4 // 已完成
        BiddingOrderStatusCancelled  = 5 // 已取消
        BiddingOrderStatusRefunding  = 6 // 退款中

        BiddingIndexPicTypeHidden = 0 // 隐藏
        BiddingIndexPicTypeShow   = 1 // 显示
)

// BiddingCategory 竞价分类
type BiddingCategory struct {
        BaseModel
        Name   string `json:"name" gorm:"size:100;not null"`
        Sort   int    `json:"sort" gorm:"default:0"`
        Status int    `json:"status" gorm:"default:1;comment:0隐藏 1展示"`
        Icon   string `json:"icon" gorm:"size:255"`
}

func (BiddingCategory) TableName() string {
        return "bidding_category"
}

// BiddingBrand 竞价品牌
type BiddingBrand struct {
        BaseModel
        Name  string `json:"name" gorm:"size:100;not null"`
        Image string `json:"image" gorm:"size:255"`
        Sort  int    `json:"sort" gorm:"default:0"`
        Cid   uint   `json:"cid" gorm:"index;comment:分类ID"`

        // Relations
        Category *BiddingCategory `json:"category,omitempty" gorm:"foreignKey:Cid"`
}

func (BiddingBrand) TableName() string {
        return "bidding_brands"
}

// BiddingType 竞价类型
type BiddingType struct {
        BaseModel
        Name  string `json:"name" gorm:"size:100;not null"`
        Image string `json:"image" gorm:"size:255"`
        Sort  int    `json:"sort" gorm:"default:0"`
        Cid   uint   `json:"cid" gorm:"index;comment:分类ID"`

        // Relations
        Category *BiddingCategory `json:"category,omitempty" gorm:"foreignKey:Cid"`
}

func (BiddingType) TableName() string {
        return "bidding_types"
}

// BiddingUser 竞价用户
type BiddingUser struct {
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

func (BiddingUser) TableName() string {
        return "bidding_user"
}

// BiddingProduct 竞价商品
type BiddingProduct struct {
        BaseModel
        CategoryID uint       `json:"category_id" gorm:"index;comment:分类ID"`
        CTypeID    uint       `json:"ctype_id" gorm:"index;comment:类型ID"`
        BrandID    uint       `json:"brand_id" gorm:"index;comment:品牌ID"`
        Title      string     `json:"title" gorm:"size:200;not null;comment:标题"`
        Image      string     `json:"image" gorm:"size:255;comment:封面图"`
        SN         string     `json:"sn" gorm:"size:100;comment:序列号"`
        IMEI       string     `json:"imei" gorm:"size:50;comment:IMEI码"`
        Grade      int        `json:"grade" gorm:"default:1;comment:1S 2A 3B"`
        Amount     float64    `json:"amount" gorm:"type:decimal(10,2);comment:数量"`
        ActiveTime string     `json:"active_time" gorm:"size:50;comment:激活时间"`
        Safeguard  string     `json:"safeguard" gorm:"size:255;comment:保修信息"`
        Battery    string     `json:"battery" gorm:"size:100;comment:电池信息"`
        Price      float64    `json:"price" gorm:"type:decimal(10,2);comment:价格"`
        Status     int        `json:"status" gorm:"default:1;comment:0下架 1上架 2禁用"`
        Options    string     `json:"options" gorm:"type:text;comment:配置选项"`
        Parts      string     `json:"parts" gorm:"type:text;comment:配件信息"`
        Info       string     `json:"info" gorm:"type:text;comment:详情"`
        AddTime    *time.Time `json:"add_time" gorm:"comment:添加时间"`
        EndTime    *time.Time `json:"end_time" gorm:"comment:结束时间"`
        Image0     string     `json:"image0" gorm:"size:255;comment:图片0"`
        Image1     string     `json:"image1" gorm:"size:255;comment:图片1"`
        Image2     string     `json:"image2" gorm:"size:255;comment:图片2"`
        Image3     string     `json:"image3" gorm:"size:255;comment:图片3"`
        Image4     string     `json:"image4" gorm:"size:255;comment:图片4"`
        Image5     string     `json:"image5" gorm:"size:255;comment:图片5"`
        Image6     string     `json:"image6" gorm:"size:255;comment:图片6"`
        Image7     string     `json:"image7" gorm:"size:255;comment:图片7"`
        Report     string     `json:"report" gorm:"type:text;comment:检测报告"`

        // Relations
        Category *BiddingCategory `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
        CType    *BiddingType     `json:"ctype,omitempty" gorm:"foreignKey:CTypeID"`
        Brand    *BiddingBrand    `json:"brand,omitempty" gorm:"foreignKey:BrandID"`
}

func (BiddingProduct) TableName() string {
        return "bidding_product"
}

// BiddingIndexPic 竞价首页轮播图
type BiddingIndexPic struct {
        BaseModel
        Title string `json:"title" gorm:"size:200;not null;comment:标题"`
        URL   string `json:"url" gorm:"size:500;comment:链接地址"`
        Path  string `json:"path" gorm:"size:255;comment:图片路径"`
        Type  int    `json:"type" gorm:"default:1;comment:0隐藏 1显示"`
        Sort  int    `json:"sort" gorm:"default:0;comment:排序"`
}

func (BiddingIndexPic) TableName() string {
        return "bidding_indexpic"
}

// BiddingOrder 竞价订单
type BiddingOrder struct {
        BaseModel
        UserID    uint       `json:"user_id" gorm:"index;not null;comment:用户ID"`
        ProductID uint       `json:"product_id" gorm:"index;not null;comment:商品ID"`
        Status    int        `json:"status" gorm:"default:0;comment:0新订单 1已付款 2已发货 3已收货 4已完成 5已取消 6退款中"`
        Price     float64    `json:"price" gorm:"type:decimal(10,2);comment:订单金额"`
        AddTime   *time.Time `json:"add_time" gorm:"comment:下单时间"`
        ExpComID  uint       `json:"exp_com_id" gorm:"index;comment:快递公司ID"`
        ExpOrder  string     `json:"exp_order" gorm:"size:100;comment:快递单号"`

        // Relations
        User    *BiddingUser    `json:"user,omitempty" gorm:"foreignKey:UserID"`
        Product *BiddingProduct `json:"product,omitempty" gorm:"foreignKey:ProductID"`
        ExpCom  *WebExpress     `json:"exp_com,omitempty" gorm:"foreignKey:ExpComID"`
}

func (BiddingOrder) TableName() string {
        return "bidding_order"
}

// WebExpress is defined in web.go
