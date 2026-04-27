package handler

import (
	"fmt"
	"le-go/internal/model"
	"le-go/internal/pkg/jwt"
	"le-go/internal/pkg/pagination"
	"le-go/internal/pkg/response"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// ============================================================================
// Helper: get optional member ID from JWT context (returns 0 if not logged in)
// ============================================================================

func getOptionalMemberID(c *gin.Context) uint {
	if v, exists := c.Get("user_id"); exists {
		if uid, ok := v.(uint); ok {
			return uid
		}
	}
	return 0
}

func getOptionalUserTel(c *gin.Context) string {
	if v, exists := c.Get("user_tel"); exists {
		if tel, ok := v.(string); ok {
			return tel
		}
	}
	return ""
}

// requireAuth checks that the request carries a valid JWT and returns the
// member WebMember record.  On failure it writes the error and returns nil.
func requireMemberAuth(c *gin.Context) *model.WebMember {
	tel := getOptionalUserTel(c)
	if tel == "" {
		response.Error(c, response.CodeLoginTimeout, "请先登录")
		return nil
	}

	var member model.WebMember
	if err := model.DB.Where("usertel = ?", tel).First(&member).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "会员不存在")
		return nil
	}
	return &member
}

// ============================================================================
// Product & Category (read-only) — public wrappers
// ============================================================================

// PublicListCategories GET /public/category
func PublicListCategories(c *gin.Context) {
	var categories []model.ProductCategory
	if err := model.DB.Order("sort ASC, id DESC").Find(&categories).Error; err != nil {
		response.ErrorServer(c)
		return
	}
	response.Success(c, categories)
}

// PublicListBrands GET /public/brand?category_id=1
func PublicListBrands(c *gin.Context) {
	query := model.DB.Model(&model.ProductBrands{})
	if categoryID := c.Query("category_id"); categoryID != "" {
		query = query.Where("type_id = ?", categoryID)
	}
	var brands []model.ProductBrands
	if err := query.Order("sort ASC, id DESC").Find(&brands).Error; err != nil {
		response.ErrorServer(c)
		return
	}
	response.Success(c, brands)
}

// PublicSearchProducts GET /public/product?keyword=&brand_id=&category_id=&ishot=&display=&sort=&page=&size=
func PublicSearchProducts(c *gin.Context) {
	p := pagination.GetParams(c)
	query := model.DB.Model(&model.ProductList{})

	// Keyword search
	if keyword := c.Query("keyword"); keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where("product_name LIKE ? OR search_text LIKE ?", like, like)
	}

	// Filter by brand_id
	if brandID := c.Query("brand_id"); brandID != "" {
		query = query.Where("brand_id = ?", brandID)
	}

	// Filter by category through brands
	if categoryID := c.Query("category_id"); categoryID != "" {
		var brandIDs []uint
		model.DB.Model(&model.ProductBrands{}).Where("type_id = ?", categoryID).Pluck("id", &brandIDs)
		if len(brandIDs) > 0 {
			query = query.Where("brand_id IN ?", brandIDs)
		} else {
			// No brands in this category, return empty
			response.SuccessPage(c, []model.ProductList{}, 0, p.Page, p.PageSize)
			return
		}
	}

	// Filter by ishot
	if ishot := c.Query("ishot"); ishot != "" {
		query = query.Where("ishot = ?", ishot)
	}

	// Filter by display (default: only show displayed products)
	display := c.Query("display")
	if display != "" {
		query = query.Where("display = ?", display)
	} else {
		query = query.Where("display = ?", 1)
	}

	// Sorting
	sort := c.DefaultQuery("sort", "default")
	switch sort {
	case "price_asc":
		query = query.Order("product_price ASC, id DESC")
	case "price_desc":
		query = query.Order("product_price DESC, id DESC")
	case "newest":
		query = query.Order("id DESC")
	default:
		query = query.Order("sort ASC, id DESC")
	}

	var total int64
	query.Count(&total)

	var products []model.ProductList
	if err := query.Offset(p.Offset).Limit(p.PageSize).Find(&products).Error; err != nil {
		response.ErrorServer(c)
		return
	}
	response.SuccessPage(c, products, total, p.Page, p.PageSize)
}

// PublicGetProduct GET /public/product/:id — reuse the same detail logic with desc pack
func PublicGetProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "invalid id")
		return
	}
	var product model.ProductList
	if err := model.DB.First(&product, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "产品不存在")
		return
	}

	result := gin.H{
		"product": product,
	}

	if product.DescID != nil && *product.DescID > 0 {
		var descList model.DescList
		if err := model.DB.First(&descList, *product.DescID).Error; err == nil {
			var titles []model.DescTitle
			model.DB.Where("desc_id = ?", *product.DescID).Order("sort ASC, id ASC").Find(&titles)

			for i := range titles {
				var options []model.DescOption
				model.DB.Where("title_id = ?", titles[i].ID).Order("sort ASC, id ASC").Find(&options)
				for j := range options {
					if options[j].ImageID != nil && *options[j].ImageID > 0 {
						var img model.DescImage
						if model.DB.First(&img, *options[j].ImageID).Error == nil {
							options[j].Info = img.Image
						}
					}
				}
				result["options_"+strconv.Itoa(int(titles[i].ID))] = options
			}
			result["desc"] = descList
			result["titles"] = titles
		}
	}

	response.Success(c, result)
}

// PublicListCoupons GET /public/coupon — only active coupons
func PublicListCoupons(c *gin.Context) {
	var coupons []model.Coupon
	query := model.DB.Model(&model.Coupon{})

	// Only show active coupons (status=1) and not expired
	now := time.Now()
	query = query.Where("status = ? AND (outtime IS NULL OR outtime > ?)", 1, now)

	if err := query.Order("sort ASC, id DESC").Find(&coupons).Error; err != nil {
		response.ErrorServer(c)
		return
	}
	response.Success(c, coupons)
}

// ============================================================================
// Pricing (read-only) — reuse existing handlers
// ============================================================================

// PublicPricingListCategory reuses PricingListCategory logic, filtering visible only
func PublicPricingListCategory(c *gin.Context) {
	var list []model.PricingCategory
	db := model.DB.Model(&model.PricingCategory{})
	// Public only sees displayed categories
	db = db.Where("status = ?", model.PricingStatusShow)
	if v := c.Query("name"); v != "" {
		db = db.Where("name LIKE ?", "%"+v+"%")
	}
	if err := db.Order("sort DESC, id DESC").Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.Success(c, list)
}

// PublicPricingListBrand public brands
func PublicPricingListBrand(c *gin.Context) {
	var list []model.PriceBrand
	db := model.DB.Model(&model.PriceBrand{})
	if v := c.Query("cid"); v != "" {
		db = db.Where("cid = ?", v)
	}
	if err := db.Order("sort DESC, id DESC").Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.Success(c, list)
}

// PublicPricingListPricing public pricing items with search
func PublicPricingListPricing(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.Pricing
	var total int64

	db := model.DB.Model(&model.Pricing{})
	if v := c.Query("category_id"); v != "" {
		db = db.Where("category_id = ?", v)
	}
	if v := c.Query("brand_id"); v != "" {
		db = db.Where("brand_id = ?", v)
	}
	if v := c.Query("keyword"); v != "" {
		db = db.Where("title LIKE ?", "%"+v+"%")
	}

	db.Count(&total)
	if err := db.Preload("Category").Preload("Brand").
		Order("id DESC").Offset(p.Offset).Limit(p.PageSize).
		Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.SuccessPage(c, list, total, p.Page, p.PageSize)
}

// ============================================================================
// Bidding (read-only) — public wrappers
// ============================================================================

// PublicBiddingListCategory shows only visible categories
func PublicBiddingListCategory(c *gin.Context) {
	var list []model.BiddingCategory
	db := model.DB.Model(&model.BiddingCategory{})
	db = db.Where("status = ?", model.BiddingStatusShow)
	if v := c.Query("name"); v != "" {
		db = db.Where("name LIKE ?", "%"+v+"%")
	}
	if err := db.Order("sort DESC, id DESC").Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.Success(c, list)
}

// PublicBiddingListBrand public bidding brands
func PublicBiddingListBrand(c *gin.Context) {
	var list []model.BiddingBrand
	db := model.DB.Model(&model.BiddingBrand{})
	if v := c.Query("cid"); v != "" {
		db = db.Where("cid = ?", v)
	}
	if err := db.Order("sort DESC, id DESC").Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.Success(c, list)
}

// PublicBiddingListType public bidding types
func PublicBiddingListType(c *gin.Context) {
	var list []model.BiddingType
	db := model.DB.Model(&model.BiddingType{})
	if v := c.Query("cid"); v != "" {
		db = db.Where("cid = ?", v)
	}
	if err := db.Order("sort DESC, id DESC").Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.Success(c, list)
}

// PublicBiddingListProduct shows only on-sale bidding products
func PublicBiddingListProduct(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.BiddingProduct
	var total int64

	db := model.DB.Model(&model.BiddingProduct{})
	// Public only sees on-sale products
	db = db.Where("status = ?", model.BiddingProductStatusOn)

	if v := c.Query("category_id"); v != "" {
		db = db.Where("category_id = ?", v)
	}
	if v := c.Query("ctype_id"); v != "" {
		db = db.Where("ctype_id = ?", v)
	}
	if v := c.Query("brand_id"); v != "" {
		db = db.Where("brand_id = ?", v)
	}
	if v := c.Query("keyword"); v != "" {
		db = db.Where("title LIKE ?", "%"+v+"%")
	}

	db.Count(&total)
	if err := db.Preload("Category").Preload("CType").Preload("Brand").
		Order("id DESC").Offset(p.Offset).Limit(p.PageSize).
		Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.SuccessPage(c, list, total, p.Page, p.PageSize)
}

// PublicBiddingGetProduct public bidding product detail
func PublicBiddingGetProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "invalid id")
		return
	}
	var data model.BiddingProduct
	if err := model.DB.Preload("Category").Preload("CType").Preload("Brand").First(&data, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "商品不存在")
		return
	}
	// Only show on-sale or active products
	if data.Status != model.BiddingProductStatusOn {
		response.Error(c, response.CodeIllegal, "商品已下架")
		return
	}
	response.Success(c, data)
}

// ============================================================================
// Articles (read-only) — reuse existing handlers
// ============================================================================

// PublicArticleListCategory lists article categories
func PublicArticleListCategory(c *gin.Context) {
	var list []model.NewsCategory
	if err := model.DB.Order("id ASC").Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.Success(c, list)
}

// PublicArticleList lists articles with optional category_id and keyword filter
func PublicArticleList(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.NewsArticle
	var total int64

	db := model.DB.Model(&model.NewsArticle{})
	if v := c.Query("category_id"); v != "" {
		db = db.Where("category_id = ?", v)
	}
	if v := c.Query("keyword"); v != "" {
		db = db.Where("title LIKE ?", "%"+v+"%")
	}
	if v := c.Query("ishot"); v != "" {
		db = db.Where("ishot = ?", v)
	}

	db.Count(&total)
	if err := db.Preload("Category").
		Order("id DESC").Offset(p.Offset).Limit(p.PageSize).
		Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.SuccessPage(c, list, total, p.Page, p.PageSize)
}

// PublicArticleGet gets a single article by id
func PublicArticleGet(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "invalid id")
		return
	}
	var article model.NewsArticle
	if err := model.DB.Preload("Category").First(&article, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "文章不存在")
		return
	}
	response.Success(c, article)
}

// ============================================================================
// Website / CMS (read-only) — reuse existing handlers where possible
// ============================================================================

// PublicGetConfig reuses WebGetConfig
func PublicGetConfig(c *gin.Context) {
	WebGetConfig(c)
}

// PublicListBanners reuses WebListIndexPic (supports type query param)
func PublicListBanners(c *gin.Context) {
	WebListIndexPic(c)
}

// PublicListProvinces reuses WebListProvince
func PublicListProvinces(c *gin.Context) {
	WebListProvince(c)
}

// PublicListCities GET /public/region/city?province_id=1
// (existing WebListCity uses path param, so we wrap it)
func PublicListCities(c *gin.Context) {
	provID := c.Query("province_id")
	if provID == "" {
		response.Error(c, response.CodeInvalidInput, "省份ID不能为空")
		return
	}
	var list []model.WebCity
	if err := model.DB.Where("prov_id = ?", provID).Order("sort DESC, id ASC").Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.Success(c, list)
}

// PublicListCounties GET /public/region/county?city_id=1
func PublicListCounties(c *gin.Context) {
	cityID := c.Query("city_id")
	if cityID == "" {
		response.Error(c, response.CodeInvalidInput, "城市ID不能为空")
		return
	}
	var list []model.WebCounty
	if err := model.DB.Where("city_id = ?", cityID).Order("sort DESC, id ASC").Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.Success(c, list)
}

// PublicListExpress reuses WebListExpress
func PublicListExpress(c *gin.Context) {
	WebListExpress(c)
}

// ============================================================================
// Member Auth: Register / Login
// ============================================================================

var phoneRegex = regexp.MustCompile(`^1[3-9]\d{9}$`)

// PublicMemberRegister POST /public/member/register
// Body: {"phone": "13800138000", "password": "123456", "sms_code": "123456"}
func PublicMemberRegister(c *gin.Context) {
	var req struct {
		Phone    string `json:"phone" binding:"required"`
		Password string `json:"password" binding:"required,min=6"`
		SmsCode  string `json:"sms_code"`
		Username string `json:"username"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "信息填写有误")
		return
	}

	// Validate phone
	if !phoneRegex.MatchString(req.Phone) {
		response.Error(c, response.CodeInvalidPhone, "手机号码不合法")
		return
	}

	// Validate SMS code (if SMS verification is enabled; skip if code is "000000" for dev)
	if req.SmsCode != "" && req.SmsCode != "000000" {
		// In production, verify SMS code from Redis cache
		// For now, any non-empty code is accepted (SMS integration pending)
		// TODO: integrate with Redis SMS verification
	}

	// Check if phone already registered
	var count int64
	model.DB.Model(&model.WebMemberAuth{}).Where("phone = ?", req.Phone).Count(&count)
	if count > 0 {
		response.Error(c, response.CodePhoneExists, "手机号码已注册")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		response.ErrorServer(c)
		return
	}

	// Create WebMember record
	now := time.Now()
	member := model.WebMember{
		Username: strings.TrimSpace(req.Username),
		UserTel:  req.Phone,
		Regtime:  &now,
	}
	if member.Username == "" {
		// Auto-generate username from phone
		member.Username = "用户" + req.Phone[len(req.Phone)-4:]
	}

	tx := model.DB.Begin()

	if err := tx.Create(&member).Error; err != nil {
		tx.Rollback()
		response.Error(c, response.CodeIllegal, "注册失败")
		return
	}

	// Create auth record
	auth := model.WebMemberAuth{
		MemberID: member.ID,
		Phone:    req.Phone,
		Password: string(hashedPassword),
	}
	if err := tx.Create(&auth).Error; err != nil {
		tx.Rollback()
		response.Error(c, response.CodeIllegal, "注册失败")
		return
	}

	tx.Commit()

	// Generate JWT token
	token, err := jwt.GenerateToken(member.ID, req.Phone, model.RoleMember, member.Username)
	if err != nil {
		response.ErrorServer(c)
		return
	}

	response.Success(c, gin.H{
		"token": token,
		"member": gin.H{
			"id":       member.ID,
			"username": member.Username,
			"usertel":  member.UserTel,
		},
	})
}

// PublicMemberLogin POST /public/member/login
// Body: {"phone": "13800138000", "password": "123456"}
func PublicMemberLogin(c *gin.Context) {
	var req struct {
		Phone    string `json:"phone" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "用户名和密码不能为空")
		return
	}

	// Find auth record
	var auth model.WebMemberAuth
	if err := model.DB.Where("phone = ?", req.Phone).First(&auth).Error; err != nil {
		response.Error(c, response.CodeLoginFailed, "用户名或密码错误")
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(auth.Password), []byte(req.Password)); err != nil {
		response.Error(c, response.CodeLoginFailed, "用户名或密码错误")
		return
	}

	// Load member profile
	var member model.WebMember
	if err := model.DB.First(&member, auth.MemberID).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "会员信息不存在")
		return
	}

	// Generate JWT token
	token, err := jwt.GenerateToken(member.ID, req.Phone, model.RoleMember, member.Username)
	if err != nil {
		response.ErrorServer(c)
		return
	}

	response.Success(c, gin.H{
		"token": token,
		"member": gin.H{
			"id":       member.ID,
			"username": member.Username,
			"usertel":  member.UserTel,
			"address":  member.Address,
			"city_id":  member.CityID,
		},
	})
}

// ============================================================================
// Member profile (JWT required)
// ============================================================================

// PublicMemberGetInfo GET /public/member/info [JWT]
func PublicMemberGetInfo(c *gin.Context) {
	member := requireMemberAuth(c)
	if member == nil {
		return
	}
	// Reload with relations
	var m model.WebMember
	if err := model.DB.Preload("Bank").Preload("City").First(&m, member.ID).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "会员不存在")
		return
	}
	response.Success(c, m)
}

// PublicMemberUpdateInfo PUT /public/member/info [JWT]
// Body: {"username": "", "address": "", "bank_id": 0, "banknum": "", "bankuser": "", "pay_meth": 0, "id_pic1": "", "id_pic2": ""}
func PublicMemberUpdateInfo(c *gin.Context) {
	member := requireMemberAuth(c)
	if member == nil {
		return
	}

	var req model.WebMember
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}

	updates := map[string]interface{}{}
	if req.Username != "" {
		updates["username"] = req.Username
	}
	if req.Address != "" {
		updates["address"] = req.Address
	}
	if req.BankID > 0 {
		updates["bank_id"] = req.BankID
	}
	if req.BankNum != "" {
		updates["banknum"] = req.BankNum
	}
	if req.BankUser != "" {
		updates["bankuser"] = req.BankUser
	}
	if req.PayMeth >= 0 {
		updates["pay_meth"] = req.PayMeth
	}
	if req.IDPic1 != "" {
		updates["id_pic1"] = req.IDPic1
	}
	if req.IDPic2 != "" {
		updates["id_pic2"] = req.IDPic2
	}
	if req.CityID > 0 {
		updates["city_id"] = req.CityID
	}
	if req.Zfb != "" {
		updates["zfb"] = req.Zfb
	}

	if len(updates) == 0 {
		response.Error(c, response.CodeInvalidInput, "没有需要更新的内容")
		return
	}

	if err := model.DB.Model(member).Updates(updates).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}

	// Reload
	model.DB.Preload("Bank").Preload("City").First(member, member.ID)
	response.Success(c, member)
}

// ============================================================================
// Member Orders (JWT required)
// ============================================================================

// PublicMemberOrders GET /public/member/orders [JWT]
func PublicMemberOrders(c *gin.Context) {
	member := requireMemberAuth(c)
	if member == nil {
		return
	}

	p := pagination.GetParams(c)
	query := model.DB.Model(&model.ProductOrder{}).Where("user_id = ?", member.ID)

	// Exclude user-deleted
	query = query.Where("user_del = ?", 0)

	// Filter by status
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	var orders []model.ProductOrder
	if err := query.Order("id DESC").Offset(p.Offset).Limit(p.PageSize).Find(&orders).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.SuccessPage(c, orders, total, p.Page, p.PageSize)
}

// ============================================================================
// Consumer Order (JWT required)
// ============================================================================

// PublicSubmitOrder POST /public/order [JWT]
// Body: {"product_id": 1, "desc_text": "...", "method": 0, "city_id": 1, "county_id": 2, "address": "...",
//
//	"coupon": "", "referee": "", "imei": "", "number": "1", "info": "", "exp_com_id": 0, "image1": "", ...}
func PublicSubmitOrder(c *gin.Context) {
	member := requireMemberAuth(c)
	if member == nil {
		return
	}

	var req struct {
		ProductID uint    `json:"product_id" binding:"required"`
		DescText  string  `json:"desc_text"`
		Method    int     `json:"method"` // 0=邮寄 1=上门 2=到店
		CityID    *uint   `json:"city_id"`
		CountyID  *uint   `json:"county_id"`
		Address   string  `json:"address"`
		Coupon    string  `json:"coupon"`
		Referee   string  `json:"referee"`
		IMEI      string  `json:"imei"`
		Number    string  `json:"number"`
		Info      string  `json:"info"`
		ExpComID  *uint   `json:"exp_com_id"`
		Image1    string  `json:"image1"`
		Image2    string  `json:"image2"`
		Image3    string  `json:"image3"`
		Image4    string  `json:"image4"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "参数错误: " + err.Error())
		return
	}

	// Verify product exists
	var product model.ProductList
	if err := model.DB.First(&product, req.ProductID).Error; err != nil {
		response.Error(c, response.CodeIllegal, "产品不存在")
		return
	}

	// Generate order ID (timestamp-based)
	orderID := fmt.Sprintf("ORD%s%04d", time.Now().Format("20060102150405"), member.ID%10000)

	userID := member.ID
	order := model.ProductOrder{
		OrderID:   orderID,
		UserID:    &userID,
		ProductID: &req.ProductID,
		Method:    req.Method,
		DescText:  req.DescText,
		CityID:    req.CityID,
		CountyID:  req.CountyID,
		Coupon:    req.Coupon,
		Referee:   req.Referee,
		IMEI:      req.IMEI,
		Number:    req.Number,
		Info:      req.Info,
		ExpComID:  req.ExpComID,
		Image1:    req.Image1,
		Image2:    req.Image2,
		Image3:    req.Image3,
		Image4:    req.Image4,
		Status:    0,
	}

	if err := model.DB.Create(&order).Error; err != nil {
		response.Error(c, response.CodeIllegal, "订单提交失败")
		return
	}

	response.Success(c, order)
}

// PublicGetOrder GET /public/order/:id [JWT]
func PublicGetOrder(c *gin.Context) {
	member := requireMemberAuth(c)
	if member == nil {
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "invalid id")
		return
	}

	var order model.ProductOrder
	if err := model.DB.First(&order, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "订单不存在")
		return
	}

	// Verify order belongs to this member
	if order.UserID == nil || *order.UserID != member.ID {
		response.Error(c, response.CodeIllegal, "无权查看该订单")
		return
	}

	response.Success(c, order)
}

// PublicListOrders GET /public/order [JWT]
// (alias for PublicMemberOrders, placed at /public/order route)
func PublicListOrders(c *gin.Context) {
	PublicMemberOrders(c)
}
