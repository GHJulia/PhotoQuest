package main

import (
    "log"
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
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

    // Auth routes don’t need token
    routes.AuthRoutes(r)

    // All routes below need JWT
	protected := r.Group("/")
	protected.Use(middlewares.JWTMiddleware())
	routes.ChallengeRoutes(protected)
	routes.GalleryRoutes(protected)

    r.Run(":8080") // API runs at localhost:8080
}