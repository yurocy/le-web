package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"le-go/internal/config"
	"le-go/internal/middleware"
	"le-go/internal/model"
	"le-go/internal/router"

	"github.com/gin-gonic/gin"
)

func main() {
	// Parse CLI flags
	cfgPath := flag.String("config", "../configs/config.yaml", "path to config file")
	flag.Parse()

	// Load configuration
	config.Init(*cfgPath)

	// Set gin mode based on config
	switch config.Cfg.Server.Mode {
	case "release":
		gin.SetMode(gin.ReleaseMode)
	case "test":
		gin.SetMode(gin.TestMode)
	default:
		gin.SetMode(gin.DebugMode)
	}

	// Initialize database
	model.InitDB(&config.Cfg.Mysql)

	// Initialize Redis
	model.InitRedis(&config.Cfg.Redis)

	// Defer close on normal exit
	defer model.Close()

	// Create gin engine
	engine := gin.New()

	// Apply built-in middleware
	engine.Use(gin.Logger())
	engine.Use(gin.Recovery())

	// Apply CORS middleware
	engine.Use(middleware.CORS())

	// Setup routes
	router.SetupRouter(engine)

	// Create HTTP server
	addr := fmt.Sprintf(":%d", config.Cfg.Server.Port)
	srv := &http.Server{
		Addr:         addr,
		Handler:      engine,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Server starting on %s (mode: %s)", addr, config.Cfg.Server.Mode)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Give outstanding requests 10 seconds to complete
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited gracefully")
}
