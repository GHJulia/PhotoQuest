package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"photoquest/config"
	middlewares "photoquest/middleware"
	"photoquest/routes"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	config.ConnectDB()

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Auth routes don't need token
	routes.AuthRoutes(r)

	// All routes below need JWT
	protected := r.Group("/")
	protected.Use(middlewares.JWTAuthMiddleware())
	routes.ProfileRoutes(protected)
	routes.MyPhotosRoutes(protected)
	routes.ChallengeRoutes(protected)
	routes.GalleryRoutes(protected)
	routes.LeaderboardRoutes(protected)
	routes.AdminRoutes(protected)

	r.Run(":8081") // API runs at localhost:8080
}
