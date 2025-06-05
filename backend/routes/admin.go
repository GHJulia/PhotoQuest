package routes

import (
	"photoquest/controllers"
	middlewares "photoquest/middleware"

	"github.com/gin-gonic/gin"
)

func AdminRoutes(rg *gin.RouterGroup) {
	admin := rg.Group("/admin")
	admin.Use(middlewares.AdminOnly())

	// User Management
	admin.GET("/users", controllers.GetAllUsers)
	admin.DELETE("/users/:id", controllers.DeleteUserByID)

	// Photography Tasks
	admin.GET("/tasks", controllers.GetAllTasks)
	admin.POST("/tasks", controllers.CreateTask)
	admin.DELETE("/tasks/:id", controllers.DeleteTask)

	admin.PUT("/users/:id", controllers.EditUserByID)
	admin.PUT("/tasks/:id", controllers.UpdateTask)
}
