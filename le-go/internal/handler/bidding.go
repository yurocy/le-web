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

// ==================== BiddingCategory ====================

// BiddingListCategory 获取竞价分类列表
func BiddingListCategory(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.BiddingCategory
	var total int64

	db := model.DB.Model(&model.BiddingCategory{})
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

// BiddingCreateCategory 创建竞价分类
func BiddingCreateCategory(c *gin.Context) {
	var data model.BiddingCategory
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

// BiddingUpdateCategory 更新竞价分类
func BiddingUpdateCategory(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.BiddingCategory
	if err := model.DB.First(&data, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "分类不存在")
		return
	}
	var req model.BiddingCategory
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

// BiddingDeleteCategory 删除竞价分类
func BiddingDeleteCategory(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.BiddingCategory{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除失败")
		return
	}
	response.Success(c, nil)
}

// ==================== BiddingBrand ====================

// BiddingListBrand 获取竞价品牌列表
func BiddingListBrand(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.BiddingBrand
	var total int64

	db := model.DB.Model(&model.BiddingBrand{})
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

// BiddingCreateBrand 创建竞价品牌
func BiddingCreateBrand(c *gin.Context) {
	var data model.BiddingBrand
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

// BiddingUpdateBrand 更新竞价品牌
func BiddingUpdateBrand(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.BiddingBrand
	if err := model.DB.First(&data, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "品牌不存在")
		return
	}
	var req model.BiddingBrand
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

// BiddingDeleteBrand 删除竞价品牌
func BiddingDeleteBrand(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.BiddingBrand{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除失败")
		return
	}
	response.Success(c, nil)
}

// ==================== BiddingType ====================

// BiddingListType 获取竞价类型列表
func BiddingListType(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.BiddingType
	var total int64

	db := model.DB.Model(&model.BiddingType{})
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

// BiddingCreateType 创建竞价类型
func BiddingCreateType(c *gin.Context) {
	var data model.BiddingType
	if err := c.ShouldBindJSON(&data); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if data.Name == "" {
		response.Error(c, response.CodeInvalidInput, "类型名称不能为空")
		return
	}
	if err := model.DB.Create(&data).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建失败")
		return
	}
	response.Success(c, data)
}

// BiddingUpdateType 更新竞价类型
func BiddingUpdateType(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.BiddingType
	if err := model.DB.First(&data, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "类型不存在")
		return
	}
	var req model.BiddingType
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

// BiddingDeleteType 删除竞价类型
func BiddingDeleteType(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.BiddingType{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除失败")
		return
	}
	response.Success(c, nil)
}

// ==================== BiddingUser ====================

// BiddingListUser 获取竞价用户列表
func BiddingListUser(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.BiddingUser
	var total int64

	db := model.DB.Model(&model.BiddingUser{})
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

// BiddingCreateUser 创建竞价用户
func BiddingCreateUser(c *gin.Context) {
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
	model.DB.Model(&model.BiddingUser{}).Where("user_tel = ?", req.UserTel).Count(&count)
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
	data := model.BiddingUser{
		UserTel:  req.UserTel,
		Username: req.Username,
		Password: string(hashedPassword),
		Address:  req.Address,
		Status:   model.BiddingUserStatusPending,
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

// BiddingUpdateUser 更新竞价用户信息
func BiddingUpdateUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.BiddingUser
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

// BiddingUpdateUserStatus 更新竞价用户审核状态
func BiddingUpdateUserStatus(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.BiddingUser
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
	if req.Status < model.BiddingUserStatusPending || req.Status > model.BiddingUserStatusDisabled {
		response.Error(c, response.CodeInvalidInput, "状态值无效")
		return
	}
	if err := model.DB.Model(&data).Update("status", req.Status).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}
	response.Success(c, data)
}

// ==================== BiddingProduct ====================

// BiddingListProduct 获取竞价商品列表
func BiddingListProduct(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.BiddingProduct
	var total int64

	db := model.DB.Model(&model.BiddingProduct{})
	if v := c.Query("category_id"); v != "" {
		db = db.Where("category_id = ?", v)
	}
	if v := c.Query("ctype_id"); v != "" {
		db = db.Where("ctype_id = ?", v)
	}
	if v := c.Query("brand_id"); v != "" {
		db = db.Where("brand_id = ?", v)
	}
	if v := c.Query("status"); v != "" {
		db = db.Where("status = ?", v)
	}
	if v := c.Query("grade"); v != "" {
		db = db.Where("grade = ?", v)
	}
	if v := c.Query("title"); v != "" {
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

// BiddingGetProduct 获取竞价商品详情
func BiddingGetProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.BiddingProduct
	if err := model.DB.Preload("Category").Preload("CType").Preload("Brand").First(&data, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			response.Error(c, response.CodeIllegal, "商品不存在")
			return
		}
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.Success(c, data)
}

// BiddingCreateProduct 创建竞价商品
func BiddingCreateProduct(c *gin.Context) {
	var data model.BiddingProduct
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

// BiddingUpdateProduct 更新竞价商品
func BiddingUpdateProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.BiddingProduct
	if err := model.DB.First(&data, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			response.Error(c, response.CodeIllegal, "商品不存在")
			return
		}
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	var req model.BiddingProduct
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if err := model.DB.Model(&data).Updates(map[string]interface{}{
		"category_id": req.CategoryID,
		"ctype_id":    req.CTypeID,
		"brand_id":    req.BrandID,
		"title":       req.Title,
		"image":       req.Image,
		"sn":          req.SN,
		"imei":        req.IMEI,
		"grade":       req.Grade,
		"amount":      req.Amount,
		"active_time": req.ActiveTime,
		"safeguard":   req.Safeguard,
		"battery":     req.Battery,
		"price":       req.Price,
		"status":      req.Status,
		"options":     req.Options,
		"parts":       req.Parts,
		"info":        req.Info,
		"end_time":    req.EndTime,
		"image0":      req.Image0,
		"image1":      req.Image1,
		"image2":      req.Image2,
		"image3":      req.Image3,
		"image4":      req.Image4,
		"image5":      req.Image5,
		"image6":      req.Image6,
		"image7":      req.Image7,
		"report":      req.Report,
	}).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}
	response.Success(c, data)
}

// BiddingDeleteProduct 删除竞价商品
func BiddingDeleteProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := model.DB.Delete(&model.BiddingProduct{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除失败")
		return
	}
	response.Success(c, nil)
}

// ==================== BiddingOrder ====================

// BiddingListOrder 获取竞价订单列表
func BiddingListOrder(c *gin.Context) {
	p := pagination.GetParams(c)
	var list []model.BiddingOrder
	var total int64

	db := model.DB.Model(&model.BiddingOrder{})
	if v := c.Query("user_id"); v != "" {
		db = db.Where("user_id = ?", v)
	}
	if v := c.Query("product_id"); v != "" {
		db = db.Where("product_id = ?", v)
	}
	if v := c.Query("status"); v != "" {
		db = db.Where("status = ?", v)
	}

	db.Count(&total)
	if err := db.Preload("User").Preload("Product").Preload("ExpCom").
		Order("id DESC").Offset(p.Offset).Limit(p.PageSize).
		Find(&list).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	response.SuccessPage(c, list, total, p.Page, p.PageSize)
}

// BiddingUpdateOrder 更新竞价订单状态/快递信息
func BiddingUpdateOrder(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var data model.BiddingOrder
	if err := model.DB.First(&data, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			response.Error(c, response.CodeInvalidOrder, "订单不存在")
			return
		}
		response.Error(c, response.CodeIllegal, "查询失败")
		return
	}
	var req struct {
		Status   int    `json:"status"`
		ExpComID uint   `json:"exp_com_id"`
		ExpOrder string `json:"exp_order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeInvalidInput, "参数错误")
		return
	}
	if err := model.DB.Model(&data).Updates(map[string]interface{}{
		"status":     req.Status,
		"exp_com_id": req.ExpComID,
		"exp_order":  req.ExpOrder,
	}).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新失败")
		return
	}
	response.Success(c, data)
}
