package routes

import (
	"github.com/gin-gonic/gin"
	"photoquest/controllers"
)

func GalleryRoutes(r *gin.Engine) {
	grp := r.Group("/gallery")
	{
		grp.GET("/", controllers.GetGalleryPosts)
		grp.POST("/like", controllers.ToggleLike)
	}
}