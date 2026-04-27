package handler

import (
	"strconv"
	"time"

	"le-go/internal/model"
	"le-go/internal/pkg/pagination"
	"le-go/internal/pkg/response"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// StockHandler handles stock-related requests
type StockHandler struct {
	DB *gorm.DB
}

// NewStockHandler creates a new StockHandler
func NewStockHandler(db *gorm.DB) *StockHandler {
	return &StockHandler{DB: db}
}

// =====================================================================
// Goods handlers
// =====================================================================

// ListGoods GET /stock/goods - list stock goods with filters
func (h *StockHandler) ListGoods(c *gin.Context) {
	p := pagination.GetParams(c)
	query := h.DB.Model(&model.StockGoods{})

	// Filter by agent_id
	if agentID := c.Query("agent_id"); agentID != "" {
		query = query.Where("agent_id = ?", agentID)
	}

	// Filter by status: in_stock (out_price=0) or sold (out_price>0)
	if status := c.Query("status"); status != "" {
		if status == "in_stock" {
			query = query.Where("out_price = 0 OR out_price IS NULL")
		} else if status == "sold" {
			query = query.Where("out_price > 0")
		}
	}

	// Date range filter
	if startDate := c.Query("start_date"); startDate != "" {
		query = query.Where("addtime >= ?", startDate)
	}
	if endDate := c.Query("end_date"); endDate != "" {
		query = query.Where("addtime <= ?", endDate+" 23:59:59")
	}

	// Keyword search (product_name, imei, exp_order)
	if keyword := c.Query("keyword"); keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where("product_name LIKE ? OR imei LIKE ? OR exp_order LIKE ?", like, like, like)
	}

	var total int64
	query.Count(&total)

	var goods []model.StockGoods
	if err := query.Order("id DESC").Offset(p.Offset).Limit(p.PageSize).Find(&goods).Error; err != nil {
		response.ErrorServer(c)
		return
	}
	response.SuccessPage(c, goods, total, p.Page, p.PageSize)
}

// GetGoods GET /stock/goods/:id - get single goods
func (h *StockHandler) GetGoods(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "invalid id")
		return
	}
	var goods model.StockGoods
	if err := h.DB.First(&goods, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "商品不存在")
		return
	}
	response.Success(c, goods)
}

// CreateGoods POST /stock/goods - create goods
func (h *StockHandler) CreateGoods(c *gin.Context) {
	var goods model.StockGoods
	if err := c.ShouldBindJSON(&goods); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}

	// Auto-calculate profit if out_price is set
	if goods.OutPrice > 0 {
		goods.Profit = goods.OutPrice - goods.AllPay
		goods.SaleTime = func() *time.Time { t := time.Now(); return &t }()
	}

	if err := h.DB.Create(&goods).Error; err != nil {
		response.ErrorServer(c)
		return
	}
	response.Success(c, goods)
}

// UpdateGoods PUT /stock/goods/:id - update goods
func (h *StockHandler) UpdateGoods(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "invalid id")
		return
	}
	var goods model.StockGoods
	if err := h.DB.First(&goods, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "商品不存在")
		return
	}
	var req model.StockGoods
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}

	updates := map[string]interface{}{}

	// If addtime provided
	if req.Addtime != nil {
		updates["addtime"] = req.Addtime
	}
	if req.ExpCom != "" {
		updates["exp_com"] = req.ExpCom
	}
	if req.ExpOrder != "" {
		updates["exp_order"] = req.ExpOrder
	}
	updates["exp_fee"] = req.ExpFee
	updates["exp_safe"] = req.ExpSafe
	updates["exp_pay"] = req.ExpPay
	if req.AgentID != nil {
		updates["agent_id"] = req.AgentID
	}
	if req.Number != "" {
		updates["number"] = req.Number
	}
	if req.ProductName != "" {
		updates["product_name"] = req.ProductName
	}
	if req.IMEI != "" {
		updates["imei"] = req.IMEI
	}
	if req.Desc != "" {
		updates["desc"] = req.Desc
	}
	updates["ass_price"] = req.AssPrice
	updates["check_price"] = req.CheckPrice
	updates["repay"] = req.Repay
	updates["last_price"] = req.LastPrice
	if req.Activity != "" {
		updates["activity"] = req.Activity
	}
	updates["all_pay"] = req.AllPay
	updates["dues"] = req.Dues
	updates["pay"] = req.Pay
	updates["out_price"] = req.OutPrice
	if req.Info != "" {
		updates["info"] = req.Info
	}

	// Auto-calculate profit when out_price > 0
	if req.OutPrice > 0 {
		allPay := req.AllPay
		if allPay == 0 {
			allPay = goods.AllPay
		}
		updates["profit"] = req.OutPrice - allPay
		now := time.Now()
		updates["sale_time"] = now
	}

	if err := h.DB.Model(&goods).Updates(updates).Error; err != nil {
		response.ErrorServer(c)
		return
	}
	h.DB.First(&goods, id)
	response.Success(c, goods)
}

// DeleteGoods DELETE /stock/goods/:id - delete goods
func (h *StockHandler) DeleteGoods(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.ErrorBadRequest(c, "invalid id")
		return
	}
	var goods model.StockGoods
	if err := h.DB.First(&goods, id).Error; err != nil {
		response.Error(c, response.CodeIllegal, "商品不存在")
		return
	}
	if err := h.DB.Delete(&goods).Error; err != nil {
		response.ErrorServer(c)
		return
	}
	response.Success(c, nil)
}

// =====================================================================
// Statistics handler
// =====================================================================

// GetStatistics GET /stock/statistics - get stock statistics
func (h *StockHandler) GetStatistics(c *gin.Context) {
	query := h.DB.Model(&model.StockGoods{})

	// Apply date range filter if provided
	if startDate := c.Query("start_date"); startDate != "" {
		query = query.Where("addtime >= ?", startDate)
	}
	if endDate := c.Query("end_date"); endDate != "" {
		query = query.Where("addtime <= ?", endDate+" 23:59:59")
	}

	// Apply agent filter if provided
	if agentID := c.Query("agent_id"); agentID != "" {
		query = query.Where("agent_id = ?", agentID)
	}

	// Total count
	var totalCount int64
	query.Count(&totalCount)

	// Out count (sold items, out_price > 0)
	var outCount int64
	h.DB.Model(&model.StockGoods{}).Scopes(func(db *gorm.DB) *gorm.DB {
		db = db.Where("out_price > 0")
		if agentID := c.Query("agent_id"); agentID != "" {
			db = db.Where("agent_id = ?", agentID)
		}
		if startDate := c.Query("start_date"); startDate != "" {
			db = db.Where("addtime >= ?", startDate)
		}
		if endDate := c.Query("end_date"); endDate != "" {
			db = db.Where("addtime <= ?", endDate+" 23:59:59")
		}
		return db
	}).Count(&outCount)

	// Stock count (unsold items, out_price = 0)
	var stockCount int64
	stockCount = totalCount - outCount

	// Total profit (sum of profit for sold items)
	type ProfitResult struct {
		TotalProfit float64
		TotalFees   float64
	}
	var profitResult ProfitResult
	h.DB.Model(&model.StockGoods{}).
		Select("COALESCE(SUM(profit), 0) as total_profit, COALESCE(SUM(exp_fee + exp_safe), 0) as total_fees").
		Scopes(func(db *gorm.DB) *gorm.DB {
			db = db.Where("out_price > 0")
			if agentID := c.Query("agent_id"); agentID != "" {
				db = db.Where("agent_id = ?", agentID)
			}
			if startDate := c.Query("start_date"); startDate != "" {
				db = db.Where("addtime >= ?", startDate)
			}
			if endDate := c.Query("end_date"); endDate != "" {
				db = db.Where("addtime <= ?", endDate+" 23:59:59")
			}
			return db
		}).
		Scan(&profitResult)

	// Total all_pay (inventory value)
	var allPayResult struct {
		TotalAllPay float64
	}
	h.DB.Model(&model.StockGoods{}).
		Select("COALESCE(SUM(all_pay), 0) as total_all_pay").
		Scopes(func(db *gorm.DB) *gorm.DB {
			if agentID := c.Query("agent_id"); agentID != "" {
				db = db.Where("agent_id = ?", agentID)
			}
			if startDate := c.Query("start_date"); startDate != "" {
				db = db.Where("addtime >= ?", startDate)
			}
			if endDate := c.Query("end_date"); endDate != "" {
				db = db.Where("addtime <= ?", endDate+" 23:59:59")
			}
			return db
		}).
		Scan(&allPayResult)

	// Daily chart data: daily in/out counts and profit for last 30 days
	type DailyStat struct {
		Date        string  `json:"date"`
		InCount     int64   `json:"in_count"`
		OutCount    int64   `json:"out_count"`
		Profit      float64 `json:"profit"`
	}

	days := 30
	if d := c.Query("days"); d != "" {
		if n, err := strconv.Atoi(d); err == nil && n > 0 && n <= 365 {
			days = n
		}
	}

	now := time.Now()
	startDay := now.AddDate(0, 0, -(days - 1)).Format("2006-01-02")

	var dailyStats []DailyStat
	h.DB.Model(&model.StockGoods{}).
		Select("DATE(addtime) as date, COUNT(*) as in_count").
		Where("addtime >= ?", startDay).
		Group("DATE(addtime)").
		Scan(&dailyStats)

	// Get sold daily stats
	type SoldDailyStat struct {
		Date     string  `json:"date"`
		OutCount int64   `json:"out_count"`
		Profit   float64 `json:"profit"`
	}
	var soldStats []SoldDailyStat
	h.DB.Model(&model.StockGoods{}).
		Select("DATE(sale_time) as date, COUNT(*) as out_count, COALESCE(SUM(profit), 0) as profit").
		Where("out_price > 0 AND sale_time >= ?", startDay).
		Group("DATE(sale_time)").
		Scan(&soldStats)

	// Merge into daily stats map
	dailyMap := make(map[string]*DailyStat)
	for i := range dailyStats {
		dailyMap[dailyStats[i].Date] = &dailyStats[i]
	}
	for i := range soldStats {
		if entry, ok := dailyMap[soldStats[i].Date]; ok {
			entry.OutCount = soldStats[i].OutCount
			entry.Profit = soldStats[i].Profit
		} else {
			dailyMap[soldStats[i].Date] = &DailyStat{
				Date:     soldStats[i].Date,
				OutCount: soldStats[i].OutCount,
				Profit:   soldStats[i].Profit,
			}
		}
	}

	// Fill in missing dates
	var chartData []DailyStat
	for i := 0; i < days; i++ {
		dateStr := now.AddDate(0, 0, -i).Format("2006-01-02")
		if entry, ok := dailyMap[dateStr]; ok {
			chartData = append(chartData, *entry)
		} else {
			chartData = append(chartData, DailyStat{
				Date: dateStr,
			})
		}
	}

	// Reverse to chronological order
	for i, j := 0, len(chartData)-1; i < j; i, j = i+1, j-1 {
		chartData[i], chartData[j] = chartData[j], chartData[i]
	}

	response.Success(c, gin.H{
		"total_count":   totalCount,
		"out_count":     outCount,
		"stock_count":   stockCount,
		"total_profit":  profitResult.TotalProfit,
		"total_fees":    profitResult.TotalFees,
		"total_all_pay": allPayResult.TotalAllPay,
		"chart":         chartData,
	})
}

// =====================================================================
// Stock admin handlers
// =====================================================================

// ListAdmin GET /stock/admin - list stock admin users
func (h *StockHandler) ListAdmin(c *gin.Context) {
	var admins []model.StockAdmin
	if err := h.DB.Order("id DESC").Find(&admins).Error; err != nil {
		response.ErrorServer(c)
		return
	}
	// Return without password (already excluded by json:"-")
	response.Success(c, admins)
}

// CreateAdmin POST /stock/admin - create a stock admin
func (h *StockHandler) CreateAdmin(c *gin.Context) {
	var input struct {
		Name     string `json:"name"`
		UserTel  string `json:"user_tel"`
		Password string `json:"password"`
		Role     int    `json:"role"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}
	if input.Name == "" {
		response.Error(c, response.CodeInvalidInput, "姓名不能为空")
		return
	}
	if input.UserTel == "" {
		response.Error(c, response.CodeInvalidInput, "手机号不能为空")
		return
	}
	if input.Password == "" {
		response.Error(c, response.CodeInvalidInput, "密码不能为空")
		return
	}

	// Check duplicate phone
	var count int64
	h.DB.Model(&model.StockAdmin{}).Where("user_tel = ?", input.UserTel).Count(&count)
	if count > 0 {
		response.Error(c, response.CodePhoneExists, "手机号已注册")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		response.ErrorServer(c)
		return
	}

	admin := model.StockAdmin{
		Name:     input.Name,
		UserTel:  input.UserTel,
		Password: string(hashedPassword),
		Role:     input.Role,
	}
	if admin.Role == 0 {
		admin.Role = model.StockRoleRegister
	}

	if err := h.DB.Create(&admin).Error; err != nil {
		response.ErrorServer(c)
		return
	}
	response.Success(c, admin)
}

// =====================================================================
// Stock user handlers
// =====================================================================

// ListUser GET /stock/user - list stock users (sources/agents)
func (h *StockHandler) ListUser(c *gin.Context) {
	var users []model.StockUser
	if err := h.DB.Order("id DESC").Find(&users).Error; err != nil {
		response.ErrorServer(c)
		return
	}
	response.Success(c, users)
}

// CreateUser POST /stock/user - create a stock user
func (h *StockHandler) CreateUser(c *gin.Context) {
	var user model.StockUser
	if err := c.ShouldBindJSON(&user); err != nil {
		response.ErrorBadRequest(c, "参数错误: "+err.Error())
		return
	}
	if user.Name == "" {
		response.Error(c, response.CodeInvalidInput, "姓名不能为空")
		return
	}
	if err := h.DB.Create(&user).Error; err != nil {
		response.ErrorServer(c)
		return
	}
	response.Success(c, user)
}
