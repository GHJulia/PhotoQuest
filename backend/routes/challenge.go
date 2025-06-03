package routes

import (
	"photoquest/controllers"

	"github.com/gin-gonic/gin"
)

func ChallengeRoutes(rg *gin.RouterGroup) {
	r := rg.Group("/challenge")
	{
		r.GET("/roll", controllers.RollChallenge)
		r.GET("/progress", controllers.GetProgress)
		r.GET("/status", controllers.GetUserChallengeStatus)
		r.POST("/accept", controllers.AcceptChallenge)
		r.POST("/upload", controllers.UploadCustomChallenge)
		r.POST("/submit", controllers.SubmitChallenge)
		r.GET("/guess/:id", controllers.GetGuessChallenge)
		r.POST("/guess/submit", controllers.SubmitGuessChallenge)
	}
}
