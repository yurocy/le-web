package handler

import (
	"strconv"
	"time"

	"le-go/internal/model"
	"le-go/internal/pkg/pagination"
	"le-go/internal/pkg/response"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// SaleHandler sale module handler
type SaleHandler struct{}

// ========== Sale Level ==========

// ListLevel returns all sale levels
func (h *SaleHandler) ListLevel(c *gin.Context) {
	var levels []model.SaleLevel
	if err := model.DB.Order("id asc").Find(&levels).Error; err != nil {
		response.Error(c, response.CodeIllegal, "查询等级列表失败")
		return
	}
	response.Success(c, levels)
}

// CreateLevel creates a new sale level
func (h *SaleHandler) CreateLevel(c *gin.Context) {
	var level model.SaleLevel
	if err := c.ShouldBindJSON(&level); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}
	if level.Name == "" {
		response.Error(c, response.CodeInvalidInput, "等级名称不能为空")
		return
	}
	if err := model.DB.Create(&level).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建等级失败")
		return
	}
	response.Success(c, level)
}

// UpdateLevel updates an existing sale level
func (h *SaleHandler) UpdateLevel(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var level model.SaleLevel
	if err := model.DB.First(&level, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "等级不存在")
		return
	}
	var req model.SaleLevel
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}
	if err := model.DB.Model(&level).Updates(map[string]interface{}{
		"name": req.Name,
		"info": req.Info,
	}).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新等级失败")
		return
	}
	response.Success(c, level)
}

// DeleteLevel deletes a sale level
func (h *SaleHandler) DeleteLevel(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	if err := model.DB.Delete(&model.SaleLevel{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除等级失败")
		return
	}
	response.Success(c, nil)
}

// ========== Sale Goods ==========

// ListGoods returns paginated sale goods list
func (h *SaleHandler) ListGoods(c *gin.Context) {
	p := pagination.GetParams(c)
	query := model.DB.Model(&model.SaleGoods{})

	// Optional filters
	if statusStr := c.Query("status"); statusStr != "" {
		if status, err := strconv.Atoi(statusStr); err == nil {
			query = query.Where("status = ?", status)
		}
	}
	if levelIDStr := c.Query("level_id"); levelIDStr != "" {
		if levelID, err := strconv.Atoi(levelIDStr); err == nil {
			query = query.Where("level_id = ?", levelID)
		}
	}
	if keyword := c.Query("keyword"); keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where("productname LIKE ?", like)
	}

	var total int64
	query.Count(&total)

	var goods []model.SaleGoods
	query.Preload("Brand").Preload("Level").
		Order("id desc").
		Offset(p.Offset).Limit(p.PageSize).
		Find(&goods)

	response.SuccessPage(c, goods, total, p.Page, p.PageSize)
}

// GetGoods returns a single sale goods detail
func (h *SaleHandler) GetGoods(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var goods model.SaleGoods
	if err := model.DB.Preload("Brand").Preload("Level").First(&goods, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "商品不存在")
		return
	}
	response.Success(c, goods)
}

// CreateGoods creates a new sale goods
func (h *SaleHandler) CreateGoods(c *gin.Context) {
	var goods model.SaleGoods
	if err := c.ShouldBindJSON(&goods); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}
	if goods.Productname == "" {
		response.Error(c, response.CodeInvalidInput, "商品名称不能为空")
		return
	}
	now := time.Now()
	goods.AddTime = &now
	if goods.Status == 0 {
		goods.Status = model.SaleGoodsStatusAuction
	}
	if err := model.DB.Create(&goods).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建商品失败")
		return
	}
	response.Success(c, goods)
}

// UpdateGoods updates an existing sale goods
func (h *SaleHandler) UpdateGoods(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var goods model.SaleGoods
	if err := model.DB.First(&goods, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "商品不存在")
		return
	}
	var req model.SaleGoods
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}
	updates := map[string]interface{}{
		"brand_id":    req.BrandID,
		"productname": req.Productname,
		"amount":      req.Amount,
		"level_id":    req.LevelID,
		"desc":        req.Desc,
		"status":      req.Status,
		"info":        req.Info,
	}
	if err := model.DB.Model(&goods).Updates(updates).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新商品失败")
		return
	}
	response.Success(c, goods)
}

// DeleteGoods deletes a sale goods
func (h *SaleHandler) DeleteGoods(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	if err := model.DB.Delete(&model.SaleGoods{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除商品失败")
		return
	}
	response.Success(c, nil)
}

// ========== Sale User ==========

// ListUser returns paginated sale users list
func (h *SaleHandler) ListUser(c *gin.Context) {
	p := pagination.GetParams(c)
	query := model.DB.Model(&model.SaleUsers{})

	// Optional filters
	if statusStr := c.Query("status"); statusStr != "" {
		if status, err := strconv.Atoi(statusStr); err == nil {
			query = query.Where("status = ?", status)
		}
	}
	if keyword := c.Query("keyword"); keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where("username LIKE ? OR company LIKE ? OR contact LIKE ?", like, like, like)
	}

	var total int64
	query.Count(&total)

	var users []model.SaleUsers
	query.Order("id desc").
		Offset(p.Offset).Limit(p.PageSize).
		Find(&users)

	response.SuccessPage(c, users, total, p.Page, p.PageSize)
}

// CreateUser creates a new sale user with bcrypt hashed password
func (h *SaleHandler) CreateUser(c *gin.Context) {
	var req model.SaleUsers
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}
	if req.Username == "" {
		response.Error(c, response.CodeInvalidInput, "用户名不能为空")
		return
	}
	if req.Password == "" {
		response.Error(c, response.CodeInvalidInput, "密码不能为空")
		return
	}

	// Hash password with bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		response.Error(c, response.CodeIllegal, "密码加密失败")
		return
	}
	req.Password = string(hashedPassword)

	if err := model.DB.Create(&req).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建用户失败")
		return
	}
	response.Success(c, req)
}

// UpdateUser updates an existing sale user
func (h *SaleHandler) UpdateUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var user model.SaleUsers
	if err := model.DB.First(&user, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "用户不存在")
		return
	}

	var req struct {
		Company    string `json:"company"`
		Username   string `json:"username"`
		Password   string `json:"password"`
		Contact    string `json:"contact"`
		UserTel    string `json:"usertel"`
		City       string `json:"city"`
		Address    string `json:"address"`
		License    string `json:"license"`
		LicPic     string `json:"lic_pic"`
		Info       string `json:"info"`
		Bank       string `json:"bank"`
		BName      string `json:"bname"`
		BNum       string `json:"bnum"`
		Status     int    `json:"status"`
		Deposit    int    `json:"deposit"`
		Validity   string `json:"validity"`
		IDCard     string `json:"idcard"`
		IDCardPic1 string `json:"idcard_pic1"`
		IDCardPic2 string `json:"idcard_pic2"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}

	updates := map[string]interface{}{
		"company":     req.Company,
		"username":    req.Username,
		"contact":     req.Contact,
		"usertel":     req.UserTel,
		"city":        req.City,
		"address":     req.Address,
		"license":     req.License,
		"lic_pic":     req.LicPic,
		"info":        req.Info,
		"bank":        req.Bank,
		"bname":       req.BName,
		"bnum":        req.BNum,
		"status":      req.Status,
		"deposit":     req.Deposit,
		"idcard":      req.IDCard,
		"idcard_pic1": req.IDCardPic1,
		"idcard_pic2": req.IDCardPic2,
	}

	// If password is provided, re-hash it
	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			response.Error(c, response.CodeIllegal, "密码加密失败")
			return
		}
		updates["password"] = string(hashedPassword)
	}

	// Handle validity date if provided
	if req.Validity != "" {
		if t, err := time.Parse("2006-01-02 15:04:05", req.Validity); err == nil {
			updates["validity"] = &t
		} else if t, err := time.Parse("2006-01-02", req.Validity); err == nil {
			updates["validity"] = &t
		}
	}

	if err := model.DB.Model(&user).Updates(updates).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新用户失败")
		return
	}
	response.Success(c, user)
}

// DeleteUser deletes a sale user
func (h *SaleHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	if err := model.DB.Delete(&model.SaleUsers{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除用户失败")
		return
	}
	response.Success(c, nil)
}

// ========== Sale Order ==========

// ListOrder returns paginated sale orders with optional status filter
func (h *SaleHandler) ListOrder(c *gin.Context) {
	p := pagination.GetParams(c)
	query := model.DB.Model(&model.SaleOrders{})

	// Filter by status
	if statusStr := c.Query("status"); statusStr != "" {
		if status, err := strconv.Atoi(statusStr); err == nil {
			query = query.Where("status = ?", status)
		}
	}

	// Filter by user_id
	if userIDStr := c.Query("user_id"); userIDStr != "" {
		if userID, err := strconv.Atoi(userIDStr); err == nil {
			query = query.Where("user_id = ?", userID)
		}
	}

	// Filter by goods_id
	if goodsIDStr := c.Query("goods_id"); goodsIDStr != "" {
		if goodsID, err := strconv.Atoi(goodsIDStr); err == nil {
			query = query.Where("goods_id = ?", goodsID)
		}
	}

	var total int64
	query.Count(&total)

	var orders []model.SaleOrders
	query.Preload("Goods").Preload("User").Preload("Express").
		Order("id desc").
		Offset(p.Offset).Limit(p.PageSize).
		Find(&orders)

	response.SuccessPage(c, orders, total, p.Page, p.PageSize)
}

// UpdateOrder updates a sale order status and related fields
func (h *SaleHandler) UpdateOrder(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var order model.SaleOrders
	if err := model.DB.First(&order, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "订单不存在")
		return
	}

	var req struct {
		Status    int    `json:"status"`
		ExpressID uint   `json:"express_id"`
		ExpressNo string `json:"express_no"`
		Info      string `json:"info"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}

	updates := map[string]interface{}{
		"status": req.Status,
	}
	if req.ExpressID > 0 {
		updates["express_id"] = req.ExpressID
	}
	if req.ExpressNo != "" {
		updates["express_no"] = req.ExpressNo
	}
	if req.Info != "" {
		updates["info"] = req.Info
	}

	now := time.Now()
	updates["updatetime"] = &now

	if err := model.DB.Model(&order).Updates(updates).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新订单失败")
		return
	}
	response.Success(c, order)
}
