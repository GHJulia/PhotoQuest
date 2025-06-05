package routes

import (
	"photoquest/controllers"
	middlewares "photoquest/middleware"

	"github.com/gin-gonic/gin"
)

func MyPhotosRoutes(router *gin.RouterGroup) {
	router.Use(middlewares.JWTAuthMiddleware())

	router.GET("/my-photos", controllers.GetMyPhotos)
	router.DELETE("/my-photos/:id", controllers.DeleteMyPhoto)
}
