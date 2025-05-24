package routes

import (
    "github.com/gin-gonic/gin"
    "photoquest/controllers"
)

func ChallengeRoutes(r *gin.Engine) {
    group := r.Group("/challenge")
    {
        group.GET("/roll", controllers.RollChallenge)
        group.POST("/accept", controllers.AcceptChallenge)
        group.POST("/skip", controllers.SkipChallenge)
    }
}