package routes

import (
	"photoquest/controllers"
	middlewares "photoquest/middleware"
	"github.com/gin-gonic/gin"
)

func ProfileRoutes(group *gin.RouterGroup) {
	group.Use(middlewares.JWTAuthMiddleware()) // ✅ correct
	
	group.GET("/profile", controllers.GetProfile)
	group.PUT("/profile", controllers.UpdateProfile)
	group.POST("/profile/upload", controllers.UploadAvatar)
	group.DELETE("/profile", controllers.DeleteAccount)
}