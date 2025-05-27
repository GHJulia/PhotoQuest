package routes

import (
	"github.com/gin-gonic/gin"
	"photoquest/controllers"
)

func GalleryRoutes(rg *gin.RouterGroup) {
	r := rg.Group("/gallery")
	{
		r.GET("/", controllers.GetGalleryPosts)
		r.POST("/like", controllers.ToggleLike)
	}
}