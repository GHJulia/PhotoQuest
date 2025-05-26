package main

import (
    "log"
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "photoquest/config"
    "photoquest/routes"
)

func main() {
    // Load .env
    if err := godotenv.Load(); err != nil {
        log.Fatal("Error loading .env file")
    }

    config.ConnectDB()
    
    r := gin.Default()
    routes.AuthRoutes(r)
    routes.ChallengeRoutes(r)

    r.Run(":8080") // API runs at localhost:8080
}