package controllers

import (
	"context"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"photoquest/config"
	"photoquest/models"
)

// GET /admin/users – Fetch all users
func AdminDashboardUsers(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.DB.Collection("users").Find(ctx, bson.M{})
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch users"})
		return
	}

	var users []models.User
	if err = cursor.All(ctx, &users); err != nil {
		c.JSON(500, gin.H{"error": "Error parsing users"})
		return
	}

	var response []gin.H
	for _, u := range users {
		joinDate := u.ID.Timestamp().Format("January 2, 2006")

		// Split full name into name and surname if needed
		name := u.Name
		surname := u.Surname
		if surname == "" && strings.Contains(name, " ") {
			parts := strings.SplitN(name, " ", 2)
			name = parts[0]
			surname = parts[1]
		}

		response = append(response, gin.H{
			"id":        u.ID.Hex(),
			"name":      name,
			"surname":   surname,
			"email":     u.Email,
			"join_date": joinDate,
			"points":    u.TotalScore,
		})
	}

	c.JSON(200, response)
}

// Edit User by ID
// PUT /admin/users/:id
func EditUserByID(c *gin.Context) {
	userID := c.Param("id")
	oid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid user ID"})
		return
	}

	var updateData struct {
		Name       string `json:"name"`
		Surname    string `json:"surname"`
		Email      string `json:"email"`
		TotalScore int    `json:"total_score"`
	}

	if err := c.BindJSON(&updateData); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"name":        updateData.Name,
			"surname":     updateData.Surname,
			"email":       updateData.Email,
			"total_score": updateData.TotalScore,
		},
	}

	_, err = config.DB.Collection("users").UpdateOne(ctx, bson.M{"_id": oid}, update)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(200, gin.H{"message": "User updated"})
}

// DELETE /admin/users/:id – Delete user by ID
func DeleteUserByID(c *gin.Context) {
	userID := c.Param("id")
	oid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid user ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = config.DB.Collection("users").DeleteOne(ctx, bson.M{"_id": oid})
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(200, gin.H{"message": "User deleted"})
}

// GET /admin/tasks – Fetch all challenges/tasks
func AdminDashboardTasks(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.DB.Collection("challenges").Find(ctx, bson.M{})
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch tasks"})
		return
	}

	var tasks []models.Challenge
	if err = cursor.All(ctx, &tasks); err != nil {
		c.JSON(500, gin.H{"error": "Error parsing tasks"})
		return
	}

	// Format tasks
	var result []gin.H
	for _, task := range tasks {
		result = append(result, gin.H{
			"task_description": task.Prompt,
			"difficulty":       task.Mode,
			"points":           task.Points,
			"created_date":     task.CreatedAt.Time().Format("January 2, 2006"),
			"status":           task.Status,
			"id":               task.ID.Hex(),
		})
	}

	c.JSON(200, result)
}

// POST /admin/tasks – Create new challenge/tasks
func CreatePhotographyTask(c *gin.Context) {
	var input struct {
		Prompt string `json:"prompt"`
		Mode   string `json:"mode"`
	}

	if err := c.BindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	if input.Prompt == "" || input.Mode == "" {
		c.JSON(400, gin.H{"error": "Missing fields"})
		return
	}

	newTask := models.Challenge{
		Prompt:    input.Prompt,
		Mode:      input.Mode,
		Points:    100,      // Default
		Status:    "active", // Default
		CreatedAt: primitive.NewDateTimeFromTime(time.Now()),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := config.DB.Collection("challenges").InsertOne(ctx, newTask)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create task"})
		return
	}

	c.JSON(200, gin.H{"message": "Task created"})
}

// Edit Task by ID
// PUT /admin/tasks/:id
func EditTaskByID(c *gin.Context) {
	taskID := c.Param("id")
	oid, err := primitive.ObjectIDFromHex(taskID)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid task ID"})
		return
	}

	var updateData struct {
		Prompt string `json:"prompt"`
		Mode   string `json:"mode"`
		Status string `json:"status"`
		Points int    `json:"points"`
	}

	if err := c.BindJSON(&updateData); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"prompt": updateData.Prompt,
			"mode":   updateData.Mode,
			"status": updateData.Status,
			"points": updateData.Points,
		},
	}

	res, err := config.DB.Collection("challenges").UpdateOne(ctx, bson.M{"_id": oid}, update)
	if err != nil {
		c.JSON(500, gin.H{
			"error":          "Failed to update task",
			"details":        err.Error(),
			"matched_count":  res.MatchedCount,
			"modified_count": res.ModifiedCount,
		})
		return
	}

	c.JSON(200, gin.H{"message": "Task updated"})
}

// DELETE /admin/tasks/:id – Delete challenge by ID
func DeleteTaskByID(c *gin.Context) {
	id := c.Param("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid task ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = config.DB.Collection("challenges").DeleteOne(ctx, bson.M{"_id": oid})
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete task"})
		return
	}

	c.JSON(200, gin.H{"message": "Task deleted"})
}
