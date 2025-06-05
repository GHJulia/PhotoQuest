package controllers

import (
	"context"
	"net/http"
	"photoquest/config"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// My photos page (only returns specific fields)
func GetMyPhotos(c *gin.Context) {
	userID := c.MustGet("user_id").(string)
	objID, _ := primitive.ObjectIDFromHex(userID)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Project only required fields
	projection := bson.D{
		bson.E{Key: "user_id", Value: 1},
		bson.E{Key: "user_name", Value: 1},
		bson.E{Key: "user_avatar", Value: 1},
		bson.E{Key: "image_url", Value: 1},
		bson.E{Key: "created_at", Value: 1},
		bson.E{Key: "likes", Value: 1},
		bson.E{Key: "prompt", Value: 1},
		bson.E{Key: "task", Value: 1},
	}

	findOptions := options.Find()
	findOptions.SetProjection(projection)

	cursor, err := config.DB.Collection("gallery_posts").Find(ctx, bson.M{"user_id": objID}, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}
	defer cursor.Close(ctx)

	var filteredPosts []bson.M
	if err = cursor.All(ctx, &filteredPosts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse posts"})
		return
	}

	c.JSON(http.StatusOK, filteredPosts)
}
