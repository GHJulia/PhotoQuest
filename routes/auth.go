package routes

import (
    "github.com/gin-gonic/gin"
    "photoquest/controllers"
)

func AuthRoutes(router *gin.Engine) {
    auth := router.Group("/auth")
    {
        auth.POST("/signup", controllers.SignUp)
        auth.POST("/login", controllers.Login)
        auth.POST("/forgot-password", controllers.ForgotPassword)
        auth.POST("/verify-otp", controllers.VerifyOTP)
        auth.POST("/reset-password", controllers.ResetPassword)
    }
}
