package routes

import (
	"photoquest/controllers"
	"github.com/gin-gonic/gin"
)

func LeaderboardRoutes(rg *gin.RouterGroup) {
	rg.GET("/leaderboard", controllers.GetLeaderboard)
}