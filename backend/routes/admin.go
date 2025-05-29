package routes

import (
	"photoquest/controllers"
	"photoquest/middleware"
	"github.com/gin-gonic/gin"
)

func AdminRoutes(rg *gin.RouterGroup) {
	admin := rg.Group("/admin")
	admin.Use(middlewares.AdminOnly())
	{
		admin.GET("/dashboard", controllers.AdminDashboard)
	}
}