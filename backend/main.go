package main

import (
    "log"
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "github.com/gin-contrib/cors"

    "photoquest/config"
    "photoquest/routes"
    "photoquest/middleware"
)

func main() {
    // Load .env
    if err := godotenv.Load(); err != nil {
        log.Fatal("Error loading .env file")
    }

    config.ConnectDB()
    
    r := gin.Default()
    r.Use(cors.Default())

    // Auth routes don’t need token
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