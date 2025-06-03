package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"photoquest/config"
	middlewares "photoquest/middleware"
	"photoquest/models"
	"photoquest/routes"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	// Initialize MongoDB connection
	config.ConnectDB()

	// Initialize collections and indexes
	userAnswer := &models.UserAnswer{}
	userAnswer.Initialize()

	// Create Gin router
	router := gin.Default()

	// Configure CORS
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Auth routes don't need token
	routes.AuthRoutes(router)

	// All routes below need JWT
	protected := router.Group("/")
	protected.Use(middlewares.JWTAuthMiddleware())
	routes.ProfileRoutes(protected)
	routes.MyPhotosRoutes(protected)
	routes.ChallengeRoutes(protected)
	routes.GalleryRoutes(protected)
	routes.LeaderboardRoutes(protected)
	routes.AdminRoutes(protected)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	router.Run(":" + port)
}
