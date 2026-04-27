package handler

import (
	"time"

	"le-go/internal/model"
	"le-go/internal/pkg/response"

	"github.com/gin-gonic/gin"
)

// GetDashboard GET /admin/dashboard - returns dashboard statistics
func GetDashboard(c *gin.Context) {
	now := time.Now()
	today := now.Format("2006-01-02")
	todayEnd := today + " 23:59:59"

	// ========== Order Statistics ==========
	// Total orders count
	var totalOrders int64
	model.DB.Model(&model.ProductOrder{}).Where("user_del = 0").Count(&totalOrders)

	// Today's new orders
	var todayOrders int64
	model.DB.Model(&model.ProductOrder{}).Where("user_del = 0 AND created_at >= ? AND created_at <= ?", today, todayEnd).Count(&todayOrders)

	// Order counts by status
	type StatusCount struct {
		Status int   `json:"status"`
		Count  int64 `json:"count"`
	}
	var statusCounts []StatusCount
	model.DB.Model(&model.ProductOrder{}).
		Select("status, COUNT(*) as count").
		Where("user_del = 0").
		Group("status").
		Scan(&statusCounts)

	// Build order status map
	orderStatusMap := make(map[int]int64)
	for _, sc := range statusCounts {
		orderStatusMap[sc.Status] = sc.Count
	}

	// ========== Revenue Statistics ==========
	// Total revenue (sum of actual_price from completed orders, status >= 5 means completed)
	var totalRevenue struct {
		Total float64
	}
	model.DB.Model(&model.ProductOrder{}).
		Select("COALESCE(SUM(actual_price), 0) as total").
		Where("user_del = 0 AND status >= 5").
		Scan(&totalRevenue)

	// Today's revenue
	var todayRevenue struct {
		Total float64
	}
	model.DB.Model(&model.ProductOrder{}).
		Select("COALESCE(SUM(actual_price), 0) as total").
		Where("user_del = 0 AND status >= 5 AND created_at >= ? AND created_at <= ?", today, todayEnd).
		Scan(&todayRevenue)

	// ========== Member Statistics ==========
	// Total registered members
	var totalMembers int64
	model.DB.Model(&model.WebMember{}).Count(&totalMembers)

	// New members today
	var todayMembers int64
	model.DB.Model(&model.WebMember{}).
		Where("created_at >= ? AND created_at <= ?", today, todayEnd).
		Count(&todayMembers)

	// ========== Stock Statistics ==========
	// Total stock goods count
	var totalStock int64
	model.DB.Model(&model.StockGoods{}).Count(&totalStock)

	// Stock value (sum of all_pay from stock_goods where out_price=0)
	var stockValue struct {
		Total float64
	}
	model.DB.Model(&model.StockGoods{}).
		Select("COALESCE(SUM(all_pay), 0) as total").
		Where("out_price = 0 OR out_price IS NULL").
		Scan(&stockValue)

	// ========== Recent 10 Orders ==========
	var recentOrders []model.ProductOrder
	model.DB.Where("user_del = 0").
		Order("id DESC").
		Limit(10).
		Find(&recentOrders)

	response.Success(c, gin.H{
		// Order stats
		"total_orders":    totalOrders,
		"today_orders":    todayOrders,
		"order_by_status": orderStatusMap,
		// Revenue
		"total_revenue": totalRevenue.Total,
		"today_revenue": todayRevenue.Total,
		// Members
		"total_members": totalMembers,
		"today_members": todayMembers,
		// Stock
		"total_stock": totalStock,
		"stock_value": stockValue.Total,
		// Recent orders
		"recent_orders": recentOrders,
	})
}
