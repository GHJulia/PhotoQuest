package routes

import (
	"photoquest/controllers"
	middlewares "photoquest/middleware"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(router *gin.Engine) {
	auth := router.Group("/auth")
	{
		auth.POST("/signup", controllers.SignUp)
		auth.POST("/login", controllers.Login)
		auth.POST("/forgot-password", controllers.ForgotPassword)
		auth.POST("/verify-otp", controllers.VerifyOTP)

		// Protected route - requires JWT
		auth.POST("/reset-password", middlewares.JWTAuthMiddleware(), controllers.ResetPassword)
	}
}
