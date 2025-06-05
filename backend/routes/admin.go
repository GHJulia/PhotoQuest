package routes

import (
    "photoquest/controllers"
    "photoquest/middleware"
    "github.com/gin-gonic/gin"
)

func AdminRoutes(rg *gin.RouterGroup) {
    admin := rg.Group("/admin")
    admin.Use(middlewares.AdminOnly())

    // User Management
    admin.GET("/users", controllers.AdminDashboardUsers)           // List users
    admin.DELETE("/users/:id", controllers.DeleteUserByID)         // Delete user

    // Photography Tasks
    admin.GET("/tasks", controllers.AdminDashboardTasks)           // List tasks
    admin.POST("/tasks", controllers.CreatePhotographyTask)        // Create new task
    admin.DELETE("/tasks/:id", controllers.DeleteTaskByID)         // Delete task

    admin.PUT("/users/:id", controllers.EditUserByID)
    admin.PUT("/tasks/:id", controllers.EditTaskByID)


}