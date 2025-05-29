package routes

import (
    "github.com/gin-gonic/gin"
    "photoquest/controllers"
)

func ChallengeRoutes(rg *gin.RouterGroup) {
    r := rg.Group("/challenge")
    {
        r.GET("/roll", controllers.RollChallenge)
        r.POST("/accept", controllers.AcceptChallenge)
        r.POST("/upload", controllers.UploadCustomChallenge)
    }
}