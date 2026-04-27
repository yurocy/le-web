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

// PartnerHandler partner module handler
type PartnerHandler struct{}

// ========== Agent ==========

// ListAgent returns paginated agent list
func (h *PartnerHandler) ListAgent(c *gin.Context) {
	p := pagination.GetParams(c)
	query := model.DB.Model(&model.AgentList{})

	// Optional filters
	if statusStr := c.Query("status"); statusStr != "" {
		if status, err := strconv.Atoi(statusStr); err == nil {
			query = query.Where("status = ?", status)
		}
	}
	if keyword := c.Query("keyword"); keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where("contact LIKE ? OR usertel LIKE ? OR area LIKE ?", like, like, like)
	}

	var total int64
	query.Count(&total)

	var agents []model.AgentList
	query.Preload("City").
		Order("sort asc, id desc").
		Offset(p.Offset).Limit(p.PageSize).
		Find(&agents)

	response.SuccessPage(c, agents, total, p.Page, p.PageSize)
}

// GetAgent returns a single agent detail
func (h *PartnerHandler) GetAgent(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var agent model.AgentList
	if err := model.DB.Preload("City").First(&agent, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "代理不存在")
		return
	}
	response.Success(c, agent)
}

// CreateAgent creates a new agent with bcrypt hashed password
func (h *PartnerHandler) CreateAgent(c *gin.Context) {
	var agent model.AgentList
	if err := c.ShouldBindJSON(&agent); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}
	if agent.UserTel == "" {
		response.Error(c, response.CodeInvalidInput, "手机号码不能为空")
		return
	}
	if agent.Password == "" {
		response.Error(c, response.CodeInvalidInput, "密码不能为空")
		return
	}

	// Hash password with bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(agent.Password), bcrypt.DefaultCost)
	if err != nil {
		response.Error(c, response.CodeIllegal, "密码加密失败")
		return
	}
	agent.Password = string(hashedPassword)

	now := time.Now()
	agent.RegTime = &now
	agent.Status = model.AgentStatusPending

	if err := model.DB.Create(&agent).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建代理失败")
		return
	}
	response.Success(c, agent)
}

// UpdateAgent updates an existing agent
func (h *PartnerHandler) UpdateAgent(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var agent model.AgentList
	if err := model.DB.First(&agent, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "代理不存在")
		return
	}

	var req struct {
		Contact   string `json:"contact"`
		Telephone string `json:"telephone"`
		CityID    uint   `json:"city_id"`
		Area      string `json:"area"`
		Address   string `json:"address"`
		Title     string `json:"title"`
		Uno       string `json:"uno"`
		Photo     string `json:"photo"`
		Sms       string `json:"sms"`
		Display   int    `json:"display"`
		Info      string `json:"info"`
		Sort      int    `json:"sort"`
		Password  string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}

	updates := map[string]interface{}{
		"contact":   req.Contact,
		"telephone": req.Telephone,
		"city_id":   req.CityID,
		"area":      req.Area,
		"address":   req.Address,
		"title":     req.Title,
		"uno":       req.Uno,
		"photo":     req.Photo,
		"sms":       req.Sms,
		"display":   req.Display,
		"info":      req.Info,
		"sort":      req.Sort,
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

	if err := model.DB.Model(&agent).Updates(updates).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新代理失败")
		return
	}
	response.Success(c, agent)
}

// DeleteAgent deletes an agent
func (h *PartnerHandler) DeleteAgent(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	if err := model.DB.Delete(&model.AgentList{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除代理失败")
		return
	}
	response.Success(c, nil)
}

// UpdateAgentStatus approves or rejects an agent application
func (h *PartnerHandler) UpdateAgentStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var agent model.AgentList
	if err := model.DB.First(&agent, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "代理不存在")
		return
	}

	var req struct {
		Status int `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "参数错误")
		return
	}

	// Validate status value
	if req.Status != model.AgentStatusDisabled && req.Status != model.AgentStatusApproved {
		response.Error(c, response.CodeInvalidInput, "无效的状态值")
		return
	}

	if err := model.DB.Model(&agent).Update("status", req.Status).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新代理状态失败")
		return
	}
	response.Success(c, agent)
}

// ========== Partner ==========

// ListPartner returns paginated partner list
func (h *PartnerHandler) ListPartner(c *gin.Context) {
	p := pagination.GetParams(c)
	query := model.DB.Model(&model.PartnerList{})

	// Optional filters
	if statusStr := c.Query("status"); statusStr != "" {
		if status, err := strconv.Atoi(statusStr); err == nil {
			query = query.Where("status = ?", status)
		}
	}
	if roleStr := c.Query("role"); roleStr != "" {
		if role, err := strconv.Atoi(roleStr); err == nil {
			query = query.Where("role = ?", role)
		}
	}
	if partnerIDStr := c.Query("partner_id"); partnerIDStr != "" {
		if pid, err := strconv.Atoi(partnerIDStr); err == nil {
			query = query.Where("partner_id = ?", pid)
		}
	}
	if keyword := c.Query("keyword"); keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where("username LIKE ? OR company LIKE ? OR contact LIKE ?", like, like, like)
	}

	var total int64
	query.Count(&total)

	var partners []model.PartnerList
	query.Preload("City").
		Order("id desc").
		Offset(p.Offset).Limit(p.PageSize).
		Find(&partners)

	response.SuccessPage(c, partners, total, p.Page, p.PageSize)
}

// GetPartner returns a single partner detail
func (h *PartnerHandler) GetPartner(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var partner model.PartnerList
	if err := model.DB.Preload("City").First(&partner, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "商家不存在")
		return
	}
	response.Success(c, partner)
}

// CreatePartner creates a new partner with bcrypt hashed password
func (h *PartnerHandler) CreatePartner(c *gin.Context) {
	var partner model.PartnerList
	if err := c.ShouldBindJSON(&partner); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}
	if partner.UserTel == "" {
		response.Error(c, response.CodeInvalidInput, "手机号码不能为空")
		return
	}
	if partner.Password == "" {
		response.Error(c, response.CodeInvalidInput, "密码不能为空")
		return
	}

	// Hash password with bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(partner.Password), bcrypt.DefaultCost)
	if err != nil {
		response.Error(c, response.CodeIllegal, "密码加密失败")
		return
	}
	partner.Password = string(hashedPassword)

	now := time.Now()
	partner.RegTime = &now
	partner.Status = model.PartnerStatusNormal

	if err := model.DB.Create(&partner).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建商家失败")
		return
	}
	response.Success(c, partner)
}

// UpdatePartner updates an existing partner
func (h *PartnerHandler) UpdatePartner(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var partner model.PartnerList
	if err := model.DB.First(&partner, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "商家不存在")
		return
	}

	var req struct {
		Username  string  `json:"username"`
		Contact   string  `json:"contact"`
		UserTel   string  `json:"usertel"`
		Company   string  `json:"company"`
		CityID    uint    `json:"city_id"`
		Role      int     `json:"role"`
		PartnerID uint    `json:"partner_id"`
		Address   string  `json:"address"`
		Status    int     `json:"status"`
		Ratio     float64 `json:"ratio"`
		Licence   string  `json:"licence"`
		LicPic    string  `json:"lic_pic"`
		Discount  float64 `json:"discount"`
		IDCard    string  `json:"id_card"`
		IDPic1    string  `json:"id_pic1"`
		IDPic2    string  `json:"id_pic2"`
		Info      string  `json:"info"`
		Password  string  `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}

	updates := map[string]interface{}{
		"username":  req.Username,
		"contact":   req.Contact,
		"usertel":   req.UserTel,
		"company":   req.Company,
		"city_id":   req.CityID,
		"role":      req.Role,
		"partner_id": req.PartnerID,
		"address":   req.Address,
		"status":    req.Status,
		"ratio":     req.Ratio,
		"licence":   req.Licence,
		"lic_pic":   req.LicPic,
		"discount":  req.Discount,
		"id_card":   req.IDCard,
		"id_pic1":   req.IDPic1,
		"id_pic2":   req.IDPic2,
		"info":      req.Info,
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

	if err := model.DB.Model(&partner).Updates(updates).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新商家失败")
		return
	}
	response.Success(c, partner)
}

// DeletePartner deletes a partner
func (h *PartnerHandler) DeletePartner(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	if err := model.DB.Delete(&model.PartnerList{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除商家失败")
		return
	}
	response.Success(c, nil)
}

// GetStoreList returns stores under a specific partner
func (h *PartnerHandler) GetStoreList(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}

	// Verify partner exists
	var partner model.PartnerList
	if err := model.DB.First(&partner, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "商家不存在")
		return
	}

	var stores []model.PartnerList
	model.DB.Where("partner_id = ? AND role = ?", id, model.PartnerRoleStore).
		Preload("City").
		Order("id desc").
		Find(&stores)

	response.Success(c, stores)
}

// ========== Partner Key ==========

// ListKey returns paginated partner key list
func (h *PartnerHandler) ListKey(c *gin.Context) {
	p := pagination.GetParams(c)
	query := model.DB.Model(&model.PartnerKey{})

	if statusStr := c.Query("status"); statusStr != "" {
		if status, err := strconv.Atoi(statusStr); err == nil {
			query = query.Where("status = ?", status)
		}
	}
	if keyword := c.Query("keyword"); keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where("title LIKE ? OR username LIKE ?", like, like)
	}

	var total int64
	query.Count(&total)

	var keys []model.PartnerKey
	query.Order("id desc").
		Offset(p.Offset).Limit(p.PageSize).
		Find(&keys)

	response.SuccessPage(c, keys, total, p.Page, p.PageSize)
}

// CreateKey creates a new partner key
func (h *PartnerHandler) CreateKey(c *gin.Context) {
	var key model.PartnerKey
	if err := c.ShouldBindJSON(&key); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}
	if key.Key == "" {
		response.Error(c, response.CodeInvalidInput, "密钥不能为空")
		return
	}
	if err := model.DB.Create(&key).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建密钥失败")
		return
	}
	response.Success(c, key)
}

// DeleteKey deletes a partner key
func (h *PartnerHandler) DeleteKey(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	if err := model.DB.Delete(&model.PartnerKey{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除密钥失败")
		return
	}
	response.Success(c, nil)
}

// ========== WholeSale ==========

// ListWholeSale returns paginated wholesale list
func (h *PartnerHandler) ListWholeSale(c *gin.Context) {
	p := pagination.GetParams(c)
	query := model.DB.Model(&model.WholeSale{})

	if typeStr := c.Query("type"); typeStr != "" {
		if t, err := strconv.Atoi(typeStr); err == nil {
			query = query.Where("type = ?", t)
		}
	}
	if keyword := c.Query("keyword"); keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where("username LIKE ? OR company LIKE ? OR usertel LIKE ?", like, like, like)
	}

	var total int64
	query.Count(&total)

	var items []model.WholeSale
	query.Order("id desc").
		Offset(p.Offset).Limit(p.PageSize).
		Find(&items)

	response.SuccessPage(c, items, total, p.Page, p.PageSize)
}

// GetWholeSale returns a single wholesale detail
func (h *PartnerHandler) GetWholeSale(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var item model.WholeSale
	if err := model.DB.First(&item, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "记录不存在")
		return
	}
	response.Success(c, item)
}

// DeleteWholeSale deletes a wholesale record
func (h *PartnerHandler) DeleteWholeSale(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	if err := model.DB.Delete(&model.WholeSale{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除记录失败")
		return
	}
	response.Success(c, nil)
}

// ========== JoinIn ==========

// ListJoinIn returns paginated join-in application list
func (h *PartnerHandler) ListJoinIn(c *gin.Context) {
	p := pagination.GetParams(c)
	query := model.DB.Model(&model.JoinIn{})

	if typeStr := c.Query("type"); typeStr != "" {
		if t, err := strconv.Atoi(typeStr); err == nil {
			query = query.Where("type = ?", t)
		}
	}
	if keyword := c.Query("keyword"); keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where("username LIKE ? OR usertel LIKE ?", like, like)
	}

	var total int64
	query.Count(&total)

	var items []model.JoinIn
	query.Order("id desc").
		Offset(p.Offset).Limit(p.PageSize).
		Find(&items)

	response.SuccessPage(c, items, total, p.Page, p.PageSize)
}

// GetJoinIn returns a single join-in application detail
func (h *PartnerHandler) GetJoinIn(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var item model.JoinIn
	if err := model.DB.First(&item, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "记录不存在")
		return
	}
	response.Success(c, item)
}

// UpdateJoinInStatus updates the status of a join-in application
func (h *PartnerHandler) UpdateJoinInStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var item model.JoinIn
	if err := model.DB.First(&item, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "记录不存在")
		return
	}

	var req struct {
		Status int    `json:"status"`
		Mark   string `json:"mark"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "参数错误")
		return
	}

	updates := map[string]interface{}{
		"status": req.Status,
	}
	if req.Mark != "" {
		updates["mark"] = req.Mark
	}

	if err := model.DB.Model(&item).Updates(updates).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新状态失败")
		return
	}
	response.Success(c, item)
}

// ========== Partner Store ==========

// ListStore returns paginated partner store list
func (h *PartnerHandler) ListStore(c *gin.Context) {
	p := pagination.GetParams(c)
	query := model.DB.Model(&model.PartnerStore{})

	if statusStr := c.Query("status"); statusStr != "" {
		if status, err := strconv.Atoi(statusStr); err == nil {
			query = query.Where("status = ?", status)
		}
	}
	if keyword := c.Query("keyword"); keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where("storename LIKE ? OR username LIKE ? OR usertel LIKE ?", like, like, like)
	}

	var total int64
	query.Count(&total)

	var stores []model.PartnerStore
	query.Preload("City").
		Order("id desc").
		Offset(p.Offset).Limit(p.PageSize).
		Find(&stores)

	response.SuccessPage(c, stores, total, p.Page, p.PageSize)
}

// GetStore returns a single partner store detail
func (h *PartnerHandler) GetStore(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var store model.PartnerStore
	if err := model.DB.Preload("City").First(&store, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "门店不存在")
		return
	}
	response.Success(c, store)
}

// CreateStore creates a new partner store
func (h *PartnerHandler) CreateStore(c *gin.Context) {
	var store model.PartnerStore
	if err := c.ShouldBindJSON(&store); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}
	if store.StoreName == "" {
		response.Error(c, response.CodeInvalidInput, "门店名称不能为空")
		return
	}
	now := time.Now()
	store.AddTime = &now
	store.Status = model.StatusNormal
	if err := model.DB.Create(&store).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建门店失败")
		return
	}
	response.Success(c, store)
}

// UpdateStore updates an existing partner store
func (h *PartnerHandler) UpdateStore(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var store model.PartnerStore
	if err := model.DB.First(&store, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "门店不存在")
		return
	}

	var req struct {
		Username  string  `json:"username"`
		UserTel   string  `json:"usertel"`
		StoreName string  `json:"storename"`
		Address   string  `json:"address"`
		SrvTime   string  `json:"srvtime"`
		Discount  float64 `json:"discount"`
		CityID    uint    `json:"city_id"`
		Info      string  `json:"info"`
		Photo     string  `json:"photo"`
		Status    int     `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}

	updates := map[string]interface{}{
		"username":  req.Username,
		"usertel":   req.UserTel,
		"storename": req.StoreName,
		"address":   req.Address,
		"srvtime":   req.SrvTime,
		"discount":  req.Discount,
		"city_id":   req.CityID,
		"info":      req.Info,
		"photo":     req.Photo,
		"status":    req.Status,
	}

	if err := model.DB.Model(&store).Updates(updates).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新门店失败")
		return
	}
	response.Success(c, store)
}

// DeleteStore deletes a partner store
func (h *PartnerHandler) DeleteStore(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	if err := model.DB.Delete(&model.PartnerStore{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除门店失败")
		return
	}
	response.Success(c, nil)
}

// ========== SubWebsite ==========

// ListSubWeb returns paginated sub-website list
func (h *PartnerHandler) ListSubWeb(c *gin.Context) {
	p := pagination.GetParams(c)
	query := model.DB.Model(&model.SubWebsite{})

	if statusStr := c.Query("status"); statusStr != "" {
		if status, err := strconv.Atoi(statusStr); err == nil {
			query = query.Where("status = ?", status)
		}
	}
	if keyword := c.Query("keyword"); keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where("title LIKE ? OR username LIKE ?", like, like)
	}

	var total int64
	query.Count(&total)

	var sites []model.SubWebsite
	query.Order("id desc").
		Offset(p.Offset).Limit(p.PageSize).
		Find(&sites)

	response.SuccessPage(c, sites, total, p.Page, p.PageSize)
}

// CreateSubWeb creates a new sub-website
func (h *PartnerHandler) CreateSubWeb(c *gin.Context) {
	var site model.SubWebsite
	if err := c.ShouldBindJSON(&site); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}
	if site.Title == "" {
		response.Error(c, response.CodeInvalidInput, "站点标题不能为空")
		return
	}
	if site.Key == "" {
		response.Error(c, response.CodeInvalidInput, "站点标识不能为空")
		return
	}
	site.Status = model.StatusNormal
	if err := model.DB.Create(&site).Error; err != nil {
		response.Error(c, response.CodeIllegal, "创建子站失败")
		return
	}
	response.Success(c, site)
}

// UpdateSubWeb updates an existing sub-website
func (h *PartnerHandler) UpdateSubWeb(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	var site model.SubWebsite
	if err := model.DB.First(&site, id).Error; err != nil {
		response.Error(c, response.CodeUserNotFound, "子站不存在")
		return
	}

	var req struct {
		Title    string  `json:"title"`
		Username string  `json:"username"`
		UserTel  string  `json:"usertel"`
		Ratio    float64 `json:"ratio"`
		Key      string  `json:"key"`
		Status   int     `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}

	updates := map[string]interface{}{
		"title":    req.Title,
		"username": req.Username,
		"usertel":  req.UserTel,
		"ratio":    req.Ratio,
		"key":      req.Key,
		"status":   req.Status,
	}

	if err := model.DB.Model(&site).Updates(updates).Error; err != nil {
		response.Error(c, response.CodeIllegal, "更新子站失败")
		return
	}
	response.Success(c, site)
}

// DeleteSubWeb deletes a sub-website
func (h *PartnerHandler) DeleteSubWeb(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "无效的ID")
		return
	}
	if err := model.DB.Delete(&model.SubWebsite{}, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "删除子站失败")
		return
	}
	response.Success(c, nil)
}
