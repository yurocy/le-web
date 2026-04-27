package handler

import (
	"le-go/internal/model"
	"le-go/internal/pkg/pagination"
	"le-go/internal/pkg/response"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// ==================== PricingCategory ====================

// ListCategory 获取报价分类列表
func PricingListCategory(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.PricingCategory
	var total int64

	db := model.DB.Model(&model.PricingCategory{})
	if v := c.Query("status"); v != "" {
		db = db.Where("status = ?", v)
	}
	if v := c.Query("name"); v != "" {
		db = db.Where("name LIKE ?", "%"+v+"%")
	}

	db.Count(&total)
	if err := db.Order("sort DESC, id DESC").Offset(p.Offset).Limit(p.PageSize).Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.SuccessPage(c, list, total, p.Page, p.PageSize)
}

// CreateCategory 创建报价分类
func PricingCreateCategory(c *gin.Context) {
	var data model.PricingCategory
	if err := c.ShouldBindJSON(&data); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if data.Name == "" {
		response.Error(c, response.CodeInvalidInput, "分类名称不能为空")
		return
	}
	if err := model.DB.Create(&data).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建失败")
		return
	}
	response.Success(c, data)
}

// UpdateCategory 更新报价分类
func PricingUpdateCategory(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.PricingCategory
	if err := model.DB.First(&data, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "分类不存在")
		return
	}
	var req model.PricingCategory
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if err := model.DB.Model(&data).Updates(map[string]interface{}{
		"name":   req.Name,
		"sort":   req.Sort,
		"status": req.Status,
		"icon":   req.Icon,
	}).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}
	response.Success(c, data)
}

// DeleteCategory 删除报价分类
func PricingDeleteCategory(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.PricingCategory{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除失败")
		return
	}
	response.Success(c, nil)
}

// ==================== PricingBrand ====================

// ListBrand 获取报价品牌列表
func PricingListBrand(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.PriceBrand
	var total int64

	db := model.DB.Model(&model.PriceBrand{})
	if v := c.Query("cid"); v != "" {
		db = db.Where("cid = ?", v)
	}
	if v := c.Query("name"); v != "" {
		db = db.Where("name LIKE ?", "%"+v+"%")
	}

	db.Count(&total)
	if err := db.Order("sort DESC, id DESC").Offset(p.Offset).Limit(p.PageSize).Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.SuccessPage(c, list, total, p.Page, p.PageSize)
}

// CreateBrand 创建报价品牌
func PricingCreateBrand(c *gin.Context) {
	var data model.PriceBrand
	if err := c.ShouldBindJSON(&data); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if data.Name == "" {
		response.Error(c, response.CodeInvalidInput, "品牌名称不能为空")
		return
	}
	if err := model.DB.Create(&data).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建失败")
		return
	}
	response.Success(c, data)
}

// UpdateBrand 更新报价品牌
func PricingUpdateBrand(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.PriceBrand
	if err := model.DB.First(&data, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "品牌不存在")
		return
	}
	var req model.PriceBrand
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if err := model.DB.Model(&data).Updates(map[string]interface{}{
		"name":  req.Name,
		"image": req.Image,
		"sort":  req.Sort,
		"cid":   req.Cid,
	}).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}
	response.Success(c, data)
}

// DeleteBrand 删除报价品牌
func PricingDeleteBrand(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.PriceBrand{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除失败")
		return
	}
	response.Success(c, nil)
}

// ==================== PricingUser ====================

// ListUser 获取报价用户列表
func PricingListUser(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.PricingUser
	var total int64

	db := model.DB.Model(&model.PricingUser{})
	if v := c.Query("status"); v != "" {
		db = db.Where("status = ?", v)
	}
	if v := c.Query("user_tel"); v != "" {
		db = db.Where("user_tel LIKE ?", "%"+v+"%")
	}
	if v := c.Query("username"); v != "" {
		db = db.Where("username LIKE ?", "%"+v+"%")
	}

	db.Count(&total)
	if err := db.Order("id DESC").Offset(p.Offset).Limit(p.PageSize).Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.SuccessPage(c, list, total, p.Page, p.PageSize)
}

// CreateUser 创建报价用户
func PricingCreateUser(c *gin.Context) {
	var req struct {
		UserTel  string `json:"user_tel"`
		Username string `json:"username"`
		Password string `json:"password"`
		Address  string `json:"address"`
		Company  string `json:"company"`
		Owner    string `json:"owner"`
		IdCard   string `json:"id_card"`
		IdPic    string `json:"id_pic"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if req.UserTel == "" || req.Username == "" || req.Password == "" {
		response.Error(c, response.CodeInvalidInput, "手机号、用户名和密码不能为空")
		return
	}

	// Check if phone already exists
	var count int64
	model.DB.Model(&model.PricingUser{}).Where("user_tel = ?", req.UserTel).Count(&count)
	if count > 0 {
		response.Error(c, response.CodePhoneExists, "手机号码已注册")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		response.Error(c, response.CodeIllegal, "密码加密失败")
		return
	}

	now := time.Now()
	data := model.PricingUser{
		UserTel:  req.UserTel,
		Username: req.Username,
		Password: string(hashedPassword),
		Address:  req.Address,
		Status:   model.PricingUserStatusPending,
		RegTime:  &now,
		Company:  req.Company,
		Owner:    req.Owner,
		IdCard:   req.IdCard,
		IdPic:    req.IdPic,
	}

	if err := model.DB.Create(&data).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建失败")
		return
	}
	response.Success(c, data)
}

// UpdateUser 更新报价用户信息
func PricingUpdateUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.PricingUser
	if err := model.DB.First(&data, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			response.Error(c, response.CodeUserNotFound, "用户不存在")
			return
		}
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	var req struct {
		Username string `json:"username"`
		Address  string `json:"address"`
		Company  string `json:"company"`
		Owner    string `json:"owner"`
		IdCard   string `json:"id_card"`
		IdPic    string `json:"id_pic"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if err := model.DB.Model(&data).Updates(map[string]interface{}{
		"username": req.Username,
		"address":  req.Address,
		"company":  req.Company,
		"owner":    req.Owner,
		"id_card":  req.IdCard,
		"id_pic":   req.IdPic,
	}).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}
	response.Success(c, data)
}

// UpdateUserStatus 更新报价用户审核状态
func PricingUpdateUserStatus(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.PricingUser
	if err := model.DB.First(&data, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			response.Error(c, response.CodeUserNotFound, "用户不存在")
			return
		}
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	var req struct {
		Status int `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if req.Status < model.PricingUserStatusPending || req.Status > model.PricingUserStatusDisabled {
		response.Error(c, response.CodeInvalidInput, "状态值无效")
		return
	}
	if err := model.DB.Model(&data).Update("status", req.Status).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}
	response.Success(c, data)
}

// ==================== Pricing ====================

// ListPricing 获取报价列表
func PricingListPricing(c *gin.Context) {
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
	if v := c.Query("title"); v != "" {
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

// GetPricing 获取报价详情
func PricingGetPricing(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.Pricing
	if err := model.DB.Preload("Category").Preload("Brand").First(&data, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			response.Error(c, response.CodeIllegal, "报价不存在")
			return
		}
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.Success(c, data)
}

// CreatePricing 创建报价
func PricingCreatePricing(c *gin.Context) {
	var data model.Pricing
	if err := c.ShouldBindJSON(&data); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if data.Title == "" {
		response.Error(c, response.CodeInvalidInput, "标题不能为空")
		return
	}
	now := time.Now()
	data.AddTime = &now
	if err := model.DB.Create(&data).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建失败")
		return
	}
	response.Success(c, data)
}

// UpdatePricing 更新报价
func PricingUpdatePricing(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.Pricing
	if err := model.DB.First(&data, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			response.Error(c, response.CodeIllegal, "报价不存在")
			return
		}
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	var req model.Pricing
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if err := model.DB.Model(&data).Updates(map[string]interface{}{
		"title":       req.Title,
		"info":        req.Info,
		"category_id": req.CategoryID,
		"brand_id":    req.BrandID,
		"image":       req.Image,
		"price_file":  req.PriceFile,
	}).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}
	response.Success(c, data)
}

// DeletePricing 删除报价
func PricingDeletePricing(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.Pricing{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除失败")
		return
	}
	response.Success(c, nil)
}
