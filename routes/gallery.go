package routes

import (
	"github.com/gin-gonic/gin"
	"photoquest/controllers"
)

func GalleryRoutes(rg *gin.RouterGroup) {
	r := rg.Group("/gallery")
	{
		r.GET("/posts", controllers.GetGalleryPosts)
		r.POST("/like", controllers.ToggleLike)
		r.POST("/share", controllers.ShareGalleryPost)
		r.POST("/answer", controllers.SubmitAnswer)
		r.GET("/post/:id",controllers.GetGalleryPostByID)
	}
}