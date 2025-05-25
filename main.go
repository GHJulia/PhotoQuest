package main

import (
    "github.com/gin-gonic/gin"
    "photoquest/config"
    "photoquest/routes"
)

func main() {
    config.ConnectDB()
    
    r := gin.Default()
    routes.AuthRoutes(r)
    routes.ChallengeRoutes(r)

    r.Run(":8080") // API runs at localhost:8080
}