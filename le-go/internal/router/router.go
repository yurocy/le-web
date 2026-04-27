package router

import (
        "le-go/internal/handler"
        "le-go/internal/middleware"
        "le-go/internal/model"

        "github.com/gin-gonic/gin"
)

// SetupRouter registers all API route groups on the gin engine.
func SetupRouter(engine *gin.Engine) {
        // Create handler instances for struct-method handlers
        ph := handler.NewProductHandler(model.DB)
        sh := handler.NewStockHandler(model.DB)
        salh := &handler.SaleHandler{}
        parh := &handler.PartnerHandler{}

        v1 := engine.Group("/api/v1")

        // ============================================================
        // Auth routes (public login/register, JWT for info/password/menus)
        // ============================================================
        auth := v1.Group("/auth")
        {
                auth.POST("/login", handler.Login)
                auth.POST("/register", handler.Register)
                auth.GET("/info", middleware.JWTAuth(), handler.GetInfo)
                auth.PUT("/password", middleware.JWTAuth(), handler.ChangePassword)
                auth.GET("/menus", middleware.JWTAuth(), handler.GetUserMenus)
        }

        // ============================================================
        // Admin management routes (JWT + RequireAdmin)
        // ============================================================
        admin := v1.Group("/admin")
        admin.Use(middleware.JWTAuth(), middleware.RequireAdmin())
        {
                // Dashboard
                admin.GET("/dashboard", handler.GetDashboard)

                // Menu CRUD
                menu := admin.Group("/menus")
                {
                        menu.GET("", handler.ListMenu)
                        menu.GET("/:id", handler.GetMenu)
                        menu.POST("", handler.CreateMenu)
                        menu.PUT("/:id", handler.UpdateMenu)
                        menu.DELETE("/:id", handler.DeleteMenu)
                }

                // Role CRUD + role-menu assignment
                role := admin.Group("/roles")
                {
                        role.GET("", handler.ListRole)
                        role.GET("/:id", handler.GetRole)
                        role.POST("", handler.CreateRole)
                        role.PUT("/:id", handler.UpdateRole)
                        role.DELETE("/:id", handler.DeleteRole)
                        role.PUT("/:id/menus", handler.UpdateRoleMenus)
                }

                // Admin user CRUD
                user := admin.Group("/users")
                {
                        user.GET("", handler.ListAdminUser)
                        user.GET("/:id", handler.GetAdminUser)
                        user.POST("", handler.CreateAdminUser)
                        user.PUT("/:id", handler.UpdateAdminUser)
                        user.DELETE("/:id", handler.DeleteAdminUser)
                }

                // Operation logs
                logs := admin.Group("/logs")
                {
                        logs.GET("", handler.ListOperationLog)
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
                product.GET("/category", ph.ListCategory)
                product.GET("/category/:id", ph.GetCategory)
                product.POST("/category", ph.CreateCategory)
                product.PUT("/category/:id", ph.UpdateCategory)
                product.DELETE("/category/:id", ph.DeleteCategory)

                // Brand
                product.GET("/brand", ph.ListBrand)
                product.POST("/brand", ph.CreateBrand)
                product.PUT("/brand/:id", ph.UpdateBrand)
                product.DELETE("/brand/:id", ph.DeleteBrand)

                // Product
                product.GET("/list", ph.ListProduct)
                product.GET("/list/:id", ph.GetProduct)
                product.POST("/list", ph.CreateProduct)
                product.PUT("/list/:id", ph.UpdateProduct)
                product.DELETE("/list/:id", ph.DeleteProduct)

                // Order
                product.GET("/order", ph.ListOrder)
                product.GET("/order/:id", ph.GetOrder)
                product.PUT("/order/:id", ph.UpdateOrder)

                // Desc Pack
                product.GET("/desc", ph.ListDesc)
                product.GET("/desc/:id", ph.ListDesc) // reuse list for single (returns all)
                product.POST("/desc", ph.CreateDesc)
                product.PUT("/desc/:id", ph.UpdateDesc)
                product.DELETE("/desc/:id", ph.DeleteDesc)

                // Coupon
                product.GET("/coupon", ph.ListCoupon)
                product.POST("/coupon", ph.CreateCoupon)
                product.PUT("/coupon/:id", ph.UpdateCoupon)
                product.DELETE("/coupon/:id", ph.DeleteCoupon)
        }

        // --- Stock Module ---
        stock := biz.Group("/stock")
        {
                stock.GET("/goods", sh.ListGoods)
                stock.GET("/goods/:id", sh.GetGoods)
                stock.POST("/goods", sh.CreateGoods)
                stock.PUT("/goods/:id", sh.UpdateGoods)
                stock.DELETE("/goods/:id", sh.DeleteGoods)
                stock.GET("/statistics", sh.GetStatistics)

                stock.GET("/admin", sh.ListAdmin)
                stock.POST("/admin", sh.CreateAdmin)

                stock.GET("/user", sh.ListUser)
                stock.POST("/user", sh.CreateUser)
        }

        // --- Sale Module ---
        sale := biz.Group("/sale")
        {
                // Level
                sale.GET("/level", salh.ListLevel)
                sale.POST("/level", salh.CreateLevel)
                sale.PUT("/level/:id", salh.UpdateLevel)
                sale.DELETE("/level/:id", salh.DeleteLevel)

                // Goods
                sale.GET("/goods", salh.ListGoods)
                sale.GET("/goods/:id", salh.GetGoods)
                sale.POST("/goods", salh.CreateGoods)
                sale.PUT("/goods/:id", salh.UpdateGoods)
                sale.DELETE("/goods/:id", salh.DeleteGoods)

                // User
                sale.GET("/user", salh.ListUser)
                sale.POST("/user", salh.CreateUser)
                sale.PUT("/user/:id", salh.UpdateUser)
                sale.DELETE("/user/:id", salh.DeleteUser)

                // Order
                sale.GET("/order", salh.ListOrder)
                sale.PUT("/order/:id", salh.UpdateOrder)
        }

        // --- Partner Module ---
        partner := biz.Group("/partner")
        {
                // Agent
                partner.GET("/agent", parh.ListAgent)
                partner.GET("/agent/:id", parh.GetAgent)
                partner.POST("/agent", parh.CreateAgent)
                partner.PUT("/agent/:id", parh.UpdateAgent)
                partner.DELETE("/agent/:id", parh.DeleteAgent)
                partner.PUT("/agent/:id/status", parh.UpdateAgentStatus)

                // Partner (商家/门店)
                partner.GET("/list", parh.ListPartner)
                partner.GET("/list/:id", parh.GetPartner)
                partner.POST("/list", parh.CreatePartner)
                partner.PUT("/list/:id", parh.UpdatePartner)
                partner.DELETE("/list/:id", parh.DeletePartner)
                partner.GET("/list/:id/stores", parh.GetStoreList)

                // Partner Key
                partner.GET("/key", parh.ListKey)
                partner.POST("/key", parh.CreateKey)
                partner.DELETE("/key/:id", parh.DeleteKey)

                // Wholesale
                partner.GET("/wholesale", parh.ListWholeSale)
                partner.GET("/wholesale/:id", parh.GetWholeSale)
                partner.DELETE("/wholesale/:id", parh.DeleteWholeSale)

                // JoinIn
                partner.GET("/joinin", parh.ListJoinIn)
                partner.GET("/joinin/:id", parh.GetJoinIn)
                partner.PUT("/joinin/:id/status", parh.UpdateJoinInStatus)

                // PartnerStore
                partner.GET("/store", parh.ListStore)
                partner.GET("/store/:id", parh.GetStore)
                partner.POST("/store", parh.CreateStore)
                partner.PUT("/store/:id", parh.UpdateStore)
                partner.DELETE("/store/:id", parh.DeleteStore)

                // SubWebsite
                partner.GET("/subweb", parh.ListSubWeb)
                partner.POST("/subweb", parh.CreateSubWeb)
                partner.PUT("/subweb/:id", parh.UpdateSubWeb)
                partner.DELETE("/subweb/:id", parh.DeleteSubWeb)
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
        // Public API routes (optional JWT — for consumer-facing website)
        // ============================================================
        pub := v1.Group("/public")
        pub.Use(middleware.OptionalJWTAuth())
        {
                // --- Product & Category (read-only) ---
                pub.GET("/category", handler.PublicListCategories)
                pub.GET("/brand", handler.PublicListBrands)
                pub.GET("/product", handler.PublicSearchProducts)
                pub.GET("/product/:id", handler.PublicGetProduct)
                pub.GET("/coupon", handler.PublicListCoupons)

                // --- Pricing (read-only) ---
                pub.GET("/pricing/category", handler.PublicPricingListCategory)
                pub.GET("/pricing/brand", handler.PublicPricingListBrand)
                pub.GET("/pricing", handler.PublicPricingListPricing)

                // --- Bidding (read-only) ---
                pub.GET("/bidding/category", handler.PublicBiddingListCategory)
                pub.GET("/bidding/brand", handler.PublicBiddingListBrand)
                pub.GET("/bidding/type", handler.PublicBiddingListType)
                pub.GET("/bidding/product", handler.PublicBiddingListProduct)
                pub.GET("/bidding/product/:id", handler.PublicBiddingGetProduct)

                // --- Articles (read-only) ---
                pub.GET("/article/category", handler.PublicArticleListCategory)
                pub.GET("/article", handler.PublicArticleList)
                pub.GET("/article/:id", handler.PublicArticleGet)

                // --- Website / CMS (read-only) ---
                pub.GET("/config", handler.PublicGetConfig)
                pub.GET("/banner", handler.PublicListBanners)
                pub.GET("/region/province", handler.PublicListProvinces)
                pub.GET("/region/city", handler.PublicListCities)
                pub.GET("/region/county", handler.PublicListCounties)
                pub.GET("/express", handler.PublicListExpress)

                // --- Member Auth ---
                pub.POST("/member/register", handler.PublicMemberRegister)
                pub.POST("/member/login", handler.PublicMemberLogin)
                pub.GET("/member/info", handler.PublicMemberGetInfo)
                pub.PUT("/member/info", handler.PublicMemberUpdateInfo)
                pub.GET("/member/orders", handler.PublicMemberOrders)

                // --- Consumer Order ---
                pub.POST("/order", handler.PublicSubmitOrder)
                pub.GET("/order/:id", handler.PublicGetOrder)
                pub.GET("/order", handler.PublicListOrders)
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
