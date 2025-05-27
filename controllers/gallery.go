package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"photoquest/config"
	"photoquest/models"
)

// Get All Gallery Posts
func GetGalleryPosts(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.DB.Collection("gallery_posts").Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database query failed"})
		return
	}

	var posts []models.GalleryPost
	if err := cursor.All(ctx, &posts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse posts"})
		return
	}

	c.JSON(http.StatusOK, posts)
}

// Like/Unlike
func ToggleLike(c *gin.Context) {
	type LikeRequest struct {
		PostID string `json:"post_id"`
		Email  string `json:"email"`
	}

	var req LikeRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	postCol := config.DB.Collection("gallery_posts")
	objectID, _ := primitive.ObjectIDFromHex(req.PostID)

	// Toggle logic
	update := bson.M{
		"$cond": []interface{}{
			bson.M{"$in": bson.A{req.Email, "$likes"}},
			bson.M{"$pull": bson.M{"likes": req.Email}},
			bson.M{"$push": bson.M{"likes": req.Email}},
		},
	}

	_, err := postCol.UpdateByID(ctx, objectID, bson.M{"$bit": update})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Like toggle failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Like toggled"})
}
