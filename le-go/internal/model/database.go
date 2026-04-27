package model

import (
        "context"
        "fmt"
        "log"
        "time"

        "le-go/internal/config"

        "github.com/redis/go-redis/v9"
        "gorm.io/driver/mysql"
        "gorm.io/gorm"
        "gorm.io/gorm/logger"
)

// DB is the global GORM database instance
var DB *gorm.DB

// RedisClient is the global Redis client instance
var RedisClient *redis.Client

// InitDB initializes the MySQL database connection with GORM and auto-migrates all models.
func InitDB(cfg *config.MysqlConfig) {
        dsn := cfg.DSN()

        var err error
        DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
                Logger: logger.Default.LogMode(logger.Info),
        })
        if err != nil {
                log.Fatalf("Failed to connect to MySQL: %v", err)
        }

        sqlDB, err := DB.DB()
        if err != nil {
                log.Fatalf("Failed to get underlying sql.DB: %v", err)
        }

        // Connection pool settings
        maxIdle := cfg.MaxIdleConns
        if maxIdle <= 0 {
                maxIdle = 10
        }
        maxOpen := cfg.MaxOpenConns
        if maxOpen <= 0 {
                maxOpen = 100
        }

        sqlDB.SetMaxIdleConns(maxIdle)
        sqlDB.SetMaxOpenConns(maxOpen)
        sqlDB.SetConnMaxLifetime(time.Hour)

        // Verify connection
        if err := sqlDB.Ping(); err != nil {
                log.Fatalf("Failed to ping MySQL: %v", err)
        }

        log.Println("MySQL connected successfully")

        // Auto-migrate all models
        err = DB.AutoMigrate(
                // common.go
                &AdminUser{},
                &Role{},
                &Menu{},
                &UserRole{},
                &RoleMenu{},
                &OperationLog{},
                // product.go
                &ProductCategory{},
                &ProductBrands{},
                &DescList{},
                &DescTitle{},
                &DescImage{},
                &DescOption{},
                &ProductList{},
                &ProductOrder{},
                &Coupon{},
                &UserCoupon{},
                // stock.go
                &StockAdmin{},
                &StockUser{},
                &StockGoods{},
                // sale.go
                &SaleLevel{},
                &SaleGoods{},
                &SaleUsers{},
                &SaleOrders{},
                // partner.go
                &AgentList{},
                &PartnerList{},
                &PartnerKey{},
                &WholeSale{},
                &JoinIn{},
                &PartnerStore{},
                &PadManage{},
                &SubWebsite{},
                // pricing.go
                &PricingCategory{},
                &PriceBrand{},
                &PricingUser{},
                &Pricing{},
                &PricingIndexPic{},
                // bidding.go
                &BiddingCategory{},
                &BiddingBrand{},
                &BiddingType{},
                &BiddingUser{},
                &BiddingProduct{},
                &BiddingIndexPic{},
                &BiddingOrder{},
                // article.go
                &NewsCategory{},
                &NewsArticle{},
                &Comment{},
                // web.go
                &WebConfig{},
                &WebIndexPic{},
                &WebBank{},
                &WebProvince{},
                &WebCity{},
                &WebCounty{},
                &WebMember{},
                &WebExpress{},
                &WebMemberAuth{},
        )
        if err != nil {
                log.Fatalf("Failed to auto-migrate: %v", err)
        }

        log.Println("Database auto-migration completed successfully")
}

// InitRedis initializes the Redis client connection.
func InitRedis(cfg *config.RedisConfig) {
        RedisClient = redis.NewClient(&redis.Options{
                Addr:     cfg.Addr(),
                Password: cfg.Password,
                DB:       cfg.DB,
        })

        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        _, err := RedisClient.Ping(ctx).Result()
        if err != nil {
                log.Fatalf("Failed to connect to Redis: %v", err)
        }

        log.Printf("Redis connected successfully (%s)", cfg.Addr())
}

// Close gracefully closes the database and Redis connections.
func Close() {
        if DB != nil {
                sqlDB, err := DB.DB()
                if err == nil && sqlDB != nil {
                        if err := sqlDB.Close(); err != nil {
                                log.Printf("Error closing MySQL connection: %v", err)
                        } else {
                                log.Println("MySQL connection closed")
                        }
                }
        }

        if RedisClient != nil {
                if err := RedisClient.Close(); err != nil {
                        log.Printf("Error closing Redis connection: %v", err)
                } else {
                        log.Println("Redis connection closed")
                }
        }

        fmt.Println("All connections closed gracefully")
}
