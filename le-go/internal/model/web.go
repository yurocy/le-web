package model

import (
        "time"
)

// ============================================================
// Web config & site models (web app)
// ============================================================

// WebConfig global site configuration
type WebConfig struct {
        BaseModel
        Webname     string `json:"webname" gorm:"size:100;comment:站点名称"`
        URL         string `json:"url" gorm:"size:255;comment:站点地址"`
        Address     string `json:"address" gorm:"size:255;comment:公司地址"`
        Webtitle    string `json:"webtitle" gorm:"size:200;comment:网站标题"`
        Webdesc     string `json:"webdesc" gorm:"size:500;comment:网站描述"`
        Webkey      string `json:"webkey" gorm:"size:500;comment:SEO关键词"`
        Copyright   string `json:"copyright" gorm:"size:255;comment:版权信息"`
        Record      string `json:"record" gorm:"size:255;comment:备案号"`
        CoveredCity string `json:"covered_city" gorm:"type:text;comment:覆盖城市"`
        Award       string `json:"award" gorm:"size:500;comment:奖励说明"`
        AwardLimit  string `json:"award_limit" gorm:"size:255;comment:奖励限制"`
}

func (WebConfig) TableName() string {
        return "web_config"
}

// WebIndexPic type constants
const (
        WebIndexPicTypePC  = 1 // 电脑版
        WebIndexPicTypeH5  = 2 // 手机版
)

// WebIndexPic homepage banner / carousel image
type WebIndexPic struct {
        BaseModel
        Title string `json:"title" gorm:"size:200;comment:图片标题"`
        URL   string `json:"url" gorm:"size:500;comment:跳转链接"`
        Path  string `json:"path" gorm:"size:500;not null;comment:图片路径"`
        Type  int    `json:"type" gorm:"default:1;not null;comment:类型 1电脑版 2手机版"`
        Sort  int    `json:"sort" gorm:"default:0;comment:排序"`
}

func (WebIndexPic) TableName() string {
        return "web_indexpic"
}

// ============================================================
// Bank models
// ============================================================

// WebBank supported bank list
type WebBank struct {
        BaseModel
        Bankname string `json:"bankname" gorm:"size:100;not null;comment:银行名称"`
        Banklogo string `json:"banklogo" gorm:"size:500;comment:银行Logo路径"`
        Sort     int    `json:"sort" gorm:"default:0;comment:排序"`
}

func (WebBank) TableName() string {
        return "web_bank"
}

// ============================================================
// Region / location models (province → city → county)
// ============================================================

// WebProvince province / state
type WebProvince struct {
        BaseModel
        Name string `json:"name" gorm:"size:50;not null;comment:省份名称"`
        Code string `json:"code" gorm:"size:20;not null;comment:行政编码"`
        Sort int    `json:"sort" gorm:"default:0;comment:排序"`
}

func (WebProvince) TableName() string {
        return "web_province"
}

// WebCity city under a province
type WebCity struct {
        BaseModel
        ProvID uint `json:"prov_id" gorm:"index;not null;comment:所属省份ID"`
        Prov   WebProvince `json:"prov" gorm:"foreignKey:ProvID"`
        Name   string `json:"name" gorm:"size:50;not null;comment:城市名称"`
        Code   string `json:"code" gorm:"size:20;not null;comment:行政编码"`
        Sort   int    `json:"sort" gorm:"default:0;comment:排序"`
}

func (WebCity) TableName() string {
        return "web_city"
}

// WebCounty county / district under a city
type WebCounty struct {
        BaseModel
        CityID uint `json:"city_id" gorm:"index;not null;comment:所属城市ID"`
        City   WebCity `json:"city" gorm:"foreignKey:CityID"`
        Name   string `json:"name" gorm:"size:50;not null;comment:区县名称"`
        Code   string `json:"code" gorm:"size:20;not null;comment:行政编码"`
        Sort   int    `json:"sort" gorm:"default:0;comment:排序"`
}

func (WebCounty) TableName() string {
        return "web_county"
}

// ============================================================
// Member / user model
// ============================================================

// WebMember payment method constants
const (
        MemberPayUnknown = 0 // 未知
        MemberPayWechat  = 1 // 微信
        MemberPayAlipay  = 2 // 支付宝
        MemberPayBank    = 3 // 银行卡
)

// WebMember frontend member / user
type WebMember struct {
        BaseModel
        Username    string     `json:"username" gorm:"size:100;comment:用户名"`
        UserTel     string     `json:"usertel" gorm:"size:20;index;comment:手机号"`
        IDCard      string     `json:"idcard" gorm:"size:20;comment:身份证号"`
        BankID      uint       `json:"bank_id" gorm:"index;comment:所属银行ID"`
        Bank        WebBank    `json:"bank" gorm:"foreignKey:BankID"`
        BankNum     string     `json:"banknum" gorm:"size:30;comment:银行卡号"`
        BankUser    string     `json:"bankuser" gorm:"size:50;comment:持卡人姓名"`
        WeNickname  string     `json:"we_nickname" gorm:"size:100;comment:微信昵称"`
        WeOpenID    string     `json:"we_openid" gorm:"size:100;index;comment:微信OpenID"`
        WeHeadImg   string     `json:"we_headimg" gorm:"size:500;comment:微信头像URL"`
        OpenID      string     `json:"openid" gorm:"size:100;index;comment:小程序OpenID"`
        Zfb         string     `json:"zfb" gorm:"size:100;comment:支付宝账号"`
        CityID      uint       `json:"city_id" gorm:"index;comment:所属城市ID"`
        City        WebCity    `json:"city" gorm:"foreignKey:CityID"`
        Address     string     `json:"address" gorm:"size:255;comment:详细地址"`
        Regtime     *time.Time `json:"regtime" gorm:"comment:注册时间"`
        PayMeth     int        `json:"pay_meth" gorm:"default:0;comment:支付方式 0未知 1微信 2支付宝 3银行卡"`
        IDPic1      string     `json:"id_pic1" gorm:"size:500;comment:身份证正面照"`
        IDPic2      string     `json:"id_pic2" gorm:"size:500;comment:身份证反面照"`
}

func (WebMember) TableName() string {
        return "web_member"
}

// ============================================================
// Express / logistics model
// ============================================================

// WebExpress supported express / logistics carriers
type WebExpress struct {
        BaseModel
        Name string `json:"name" gorm:"size:100;not null;comment:快递公司名称"`
        Code string `json:"code" gorm:"size:50;not null;comment:快递公司编码"`
        Sort int    `json:"sort" gorm:"default:0;comment:排序"`
}

func (WebExpress) TableName() string {
        return "web_express"
}

// ============================================================
// Member auth model (stores login credentials separately)
// ============================================================

// WebMemberAuth member login credentials (linked to WebMember)
type WebMemberAuth struct {
        BaseModel
        MemberID uint   `json:"member_id" gorm:"uniqueIndex;not null;comment:会员ID"`
        Phone    string `json:"phone" gorm:"size:20;uniqueIndex;not null;comment:手机号"`
        Password string `json:"-" gorm:"size:256;not null;comment:密码(bcrypt)"`
}

func (WebMemberAuth) TableName() string {
        return "web_member_auth"
}
