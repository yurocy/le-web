package router

import (
	"le-go/internal/handler"
	"le-go/internal/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRouter registers all API route groups on the gin engine.
func SetupRouter(engine *gin.Engine) {
	v1 := engine.Group("/api/v1")

	// ============================================================
	// Auth routes (public login/register, JWT for info/password)
	// ============================================================
	auth := v1.Group("/auth")
	{
		auth.POST("/login", handler.Login)
		auth.POST("/register", handler.Register)
		auth.GET("/info", middleware.JWTAuth(), handler.GetInfo)
		auth.PUT("/password", middleware.JWTAuth(), handler.ChangePassword)
	}

	// ============================================================
	// Admin management routes (JWT + RequireAdmin)
	// ============================================================
	admin := v1.Group("/admin")
	admin.Use(middleware.JWTAuth(), middleware.RequireAdmin())
	{
		// Menu CRUD
		menu := admin.Group("/menus")
		{
			menu.GET("", notImplemented)
			menu.GET("/:id", notImplemented)
			menu.POST("", notImplemented)
			menu.PUT("/:id", notImplemented)
			menu.DELETE("/:id", notImplemented)
		}

		// Role CRUD
		role := admin.Group("/roles")
		{
			role.GET("", notImplemented)
			role.GET("/:id", notImplemented)
			role.POST("", notImplemented)
			role.PUT("/:id", notImplemented)
			role.DELETE("/:id", notImplemented)
		}

		// Admin user CRUD
		user := admin.Group("/users")
		{
			user.GET("", notImplemented)
			user.GET("/:id", notImplemented)
			user.POST("", notImplemented)
			user.PUT("/:id", notImplemented)
			user.DELETE("/:id", notImplemented)
		}

		// Operation logs
		logs := admin.Group("/logs")
		{
			logs.GET("", notImplemented)
		}
	}

	// ============================================================
	// Business API routes (JWT auth required)
	// ============================================================
	biz := v1.Group("")
	biz.Use(middleware.JWTAuth())

	// --- Product Module ---
	product := biz.Group("/product")
	{
		// Category
		product.GET("/category", handler.ListCategory)
		product.GET("/category/:id", handler.GetCategory)
		product.POST("/category", handler.CreateCategory)
		product.PUT("/category/:id", handler.UpdateCategory)
		product.DELETE("/category/:id", handler.DeleteCategory)

		// Brand
		product.GET("/brand", handler.ListBrand)
		product.POST("/brand", handler.CreateBrand)
		product.PUT("/brand/:id", handler.UpdateBrand)
		product.DELETE("/brand/:id", handler.DeleteBrand)

		// Product
		product.GET("/list", handler.ListProduct)
		product.GET("/list/:id", handler.GetProduct)
		product.POST("/list", handler.CreateProduct)
		product.PUT("/list/:id", handler.UpdateProduct)
		product.DELETE("/list/:id", handler.DeleteProduct)

		// Order
		product.GET("/order", handler.ListOrder)
		product.GET("/order/:id", handler.GetOrder)
		product.PUT("/order/:id", handler.UpdateOrder)

		// Desc Pack
		product.GET("/desc", handler.ListDesc)
		product.GET("/desc/:id", handler.ListDesc) // reuse list for single (returns all)
		product.POST("/desc", handler.CreateDesc)
		product.PUT("/desc/:id", handler.UpdateDesc)
		product.DELETE("/desc/:id", handler.DeleteDesc)

		// Coupon
		product.GET("/coupon", handler.ListCoupon)
		product.POST("/coupon", handler.CreateCoupon)
		product.PUT("/coupon/:id", handler.UpdateCoupon)
		product.DELETE("/coupon/:id", handler.DeleteCoupon)
	}

	// --- Stock Module ---
	stock := biz.Group("/stock")
	{
		stock.GET("/goods", handler.ListGoods)
		stock.GET("/goods/:id", handler.GetGoods)
		stock.POST("/goods", handler.CreateGoods)
		stock.PUT("/goods/:id", handler.UpdateGoods)
		stock.DELETE("/goods/:id", handler.DeleteGoods)
		stock.GET("/statistics", handler.GetStatistics)

		stock.GET("/admin", handler.ListAdmin)
		stock.POST("/admin", handler.CreateAdmin)

		stock.GET("/user", handler.ListUser)
		stock.POST("/user", handler.CreateUser)
	}

	// --- Sale Module ---
	sale := biz.Group("/sale")
	{
		// Level
		sale.GET("/level", handler.ListLevel)
		sale.POST("/level", handler.CreateLevel)
		sale.PUT("/level/:id", handler.UpdateLevel)
		sale.DELETE("/level/:id", handler.DeleteLevel)

		// Goods
		sale.GET("/goods", handler.ListGoodsSale)
		sale.GET("/goods/:id", handler.GetGoodsSale)
		sale.POST("/goods", handler.CreateGoodsSale)
		sale.PUT("/goods/:id", handler.UpdateGoodsSale)
		sale.DELETE("/goods/:id", handler.DeleteGoodsSale)

		// User
		sale.GET("/user", handler.ListUserSale)
		sale.POST("/user", handler.CreateUserSale)
		sale.PUT("/user/:id", handler.UpdateUserSale)
		sale.DELETE("/user/:id", handler.DeleteUserSale)

		// Order
		sale.GET("/order", handler.ListOrderSale)
		sale.PUT("/order/:id", handler.UpdateOrderSale)
	}

	// --- Partner Module ---
	partner := biz.Group("/partner")
	{
		// Agent
		partner.GET("/agent", handler.ListAgent)
		partner.GET("/agent/:id", handler.GetAgent)
		partner.POST("/agent", handler.CreateAgent)
		partner.PUT("/agent/:id", handler.UpdateAgent)
		partner.DELETE("/agent/:id", handler.DeleteAgent)
		partner.PUT("/agent/:id/status", handler.UpdateAgentStatus)

		// Partner (商家/门店)
		partner.GET("/list", handler.ListPartner)
		partner.GET("/list/:id", handler.GetPartner)
		partner.POST("/list", handler.CreatePartner)
		partner.PUT("/list/:id", handler.UpdatePartner)
		partner.DELETE("/list/:id", handler.DeletePartner)
		partner.GET("/list/:id/stores", handler.GetStoreList)

		// Partner Key
		partner.GET("/key", handler.ListKey)
		partner.POST("/key", handler.CreateKey)
		partner.DELETE("/key/:id", handler.DeleteKey)

		// Wholesale
		partner.GET("/wholesale", handler.ListWholeSale)
		partner.GET("/wholesale/:id", handler.GetWholeSale)
		partner.DELETE("/wholesale/:id", handler.DeleteWholeSale)

		// JoinIn
		partner.GET("/joinin", handler.ListJoinIn)
		partner.GET("/joinin/:id", handler.GetJoinIn)
		partner.PUT("/joinin/:id/status", handler.UpdateJoinInStatus)

		// PartnerStore
		partner.GET("/store", handler.ListStore)
		partner.GET("/store/:id", handler.GetStore)
		partner.POST("/store", handler.CreateStore)
		partner.PUT("/store/:id", handler.UpdateStore)
		partner.DELETE("/store/:id", handler.DeleteStore)

		// SubWebsite
		partner.GET("/subweb", handler.ListSubWeb)
		partner.POST("/subweb", handler.CreateSubWeb)
		partner.PUT("/subweb/:id", handler.UpdateSubWeb)
		partner.DELETE("/subweb/:id", handler.DeleteSubWeb)
	}

	// --- Pricing Module ---
	pricing := biz.Group("/pricing")
	{
		pricing.GET("/category", handler.PricingListCategory)
		pricing.POST("/category", handler.PricingCreateCategory)
		pricing.PUT("/category/:id", handler.PricingUpdateCategory)
		pricing.DELETE("/category/:id", handler.PricingDeleteCategory)

		pricing.GET("/brand", handler.PricingListBrand)
		pricing.POST("/brand", handler.PricingCreateBrand)
		pricing.PUT("/brand/:id", handler.PricingUpdateBrand)
		pricing.DELETE("/brand/:id", handler.PricingDeleteBrand)

		pricing.GET("/user", handler.PricingListUser)
		pricing.POST("/user", handler.PricingCreateUser)
		pricing.PUT("/user/:id", handler.PricingUpdateUser)
		pricing.PUT("/user/:id/status", handler.PricingUpdateUserStatus)

		pricing.GET("/pricing", handler.PricingListPricing)
		pricing.GET("/pricing/:id", handler.PricingGetPricing)
		pricing.POST("/pricing", handler.PricingCreatePricing)
		pricing.PUT("/pricing/:id", handler.PricingUpdatePricing)
		pricing.DELETE("/pricing/:id", handler.PricingDeletePricing)
	}

	// --- Bidding Module ---
	bidding := biz.Group("/bidding")
	{
		bidding.GET("/category", handler.BiddingListCategory)
		bidding.POST("/category", handler.BiddingCreateCategory)
		bidding.PUT("/category/:id", handler.BiddingUpdateCategory)
		bidding.DELETE("/category/:id", handler.BiddingDeleteCategory)

		bidding.GET("/brand", handler.BiddingListBrand)
		bidding.POST("/brand", handler.BiddingCreateBrand)
		bidding.PUT("/brand/:id", handler.BiddingUpdateBrand)
		bidding.DELETE("/brand/:id", handler.BiddingDeleteBrand)

		bidding.GET("/type", handler.BiddingListType)
		bidding.POST("/type", handler.BiddingCreateType)
		bidding.PUT("/type/:id", handler.BiddingUpdateType)
		bidding.DELETE("/type/:id", handler.BiddingDeleteType)

		bidding.GET("/user", handler.BiddingListUser)
		bidding.POST("/user", handler.BiddingCreateUser)
		bidding.PUT("/user/:id", handler.BiddingUpdateUser)
		bidding.PUT("/user/:id/status", handler.BiddingUpdateUserStatus)

		bidding.GET("/product", handler.BiddingListProduct)
		bidding.GET("/product/:id", handler.BiddingGetProduct)
		bidding.POST("/product", handler.BiddingCreateProduct)
		bidding.PUT("/product/:id", handler.BiddingUpdateProduct)
		bidding.DELETE("/product/:id", handler.BiddingDeleteProduct)

		bidding.GET("/order", handler.BiddingListOrder)
		bidding.PUT("/order/:id", handler.BiddingUpdateOrder)
	}

	// --- Article Module ---
	article := biz.Group("/article")
	{
		article.GET("/category", handler.ArticleListCategory)
		article.POST("/category", handler.ArticleCreateCategory)
		article.PUT("/category/:id", handler.ArticleUpdateCategory)
		article.DELETE("/category/:id", handler.ArticleDeleteCategory)

		article.GET("/article", handler.ArticleListArticle)
		article.GET("/article/:id", handler.ArticleGetArticle)
		article.POST("/article", handler.ArticleCreateArticle)
		article.PUT("/article/:id", handler.ArticleUpdateArticle)
		article.DELETE("/article/:id", handler.ArticleDeleteArticle)

		article.GET("/comment", handler.ArticleListComment)
		article.DELETE("/comment/:id", handler.ArticleDeleteComment)
	}

	// --- Web Module ---
	web := biz.Group("/web")
	{
		web.GET("/config", handler.WebGetConfig)
		web.PUT("/config", handler.WebUpdateConfig)

		web.GET("/indexpic", handler.WebListIndexPic)
		web.POST("/indexpic", handler.WebCreateIndexPic)
		web.PUT("/indexpic/:id", handler.WebUpdateIndexPic)
		web.DELETE("/indexpic/:id", handler.WebDeleteIndexPic)

		web.GET("/bank", handler.WebListBank)
		web.POST("/bank", handler.WebCreateBank)
		web.PUT("/bank/:id", handler.WebUpdateBank)
		web.DELETE("/bank/:id", handler.WebDeleteBank)

		// Region data (read-only from admin)
		web.GET("/province", handler.WebListProvince)
		web.GET("/city", handler.WebListCity)
		web.GET("/county", handler.WebListCounty)

		web.GET("/member", handler.WebListMember)
		web.GET("/member/:id", handler.WebGetMember)
		web.PUT("/member/:id", handler.WebUpdateMember)
		web.DELETE("/member/:id", handler.WebDeleteMember)

		web.GET("/express", handler.WebListExpress)
		web.POST("/express", handler.WebCreateExpress)
		web.PUT("/express/:id", handler.WebUpdateExpress)
		web.DELETE("/express/:id", handler.WebDeleteExpress)
	}

	// ============================================================
	// Public routes (no auth required)
	// ============================================================
	v1.POST("/sms/send", notImplemented)
	v1.POST("/upload", notImplemented)

	// Health check
	engine.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
}

// notImplemented is a placeholder handler that returns "not implemented".
func notImplemented(c *gin.Context) {
	c.JSON(200, gin.H{
		"code":    -1,
		"message": "not implemented",
	})
}
