package controllers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"photoquest/config"
	"photoquest/models"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// My photos page (only returns specific fields)
func GetMyPhotos(c *gin.Context) {
	userID := c.MustGet("user_id").(string)
	objID, _ := primitive.ObjectIDFromHex(userID)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := config.DB.Collection("gallery_posts").Find(ctx, bson.M{"user_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}
	defer cursor.Close(ctx)

	var posts []models.GalleryPost
	if err = cursor.All(ctx, &posts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse posts"})
		return
	}

	// Convert posts to response format
	var response []gin.H
	for _, post := range posts {
		response = append(response, gin.H{
			"id":         post.ID.Hex(),
			"image_url":  post.ImageURL,
			"created_at": post.CreatedAt,
			"likes":      post.Likes,
			"task":       post.Task,
			"prompt":     post.Prompt,
		})
	}

	c.JSON(http.StatusOK, response)
}

// Delete a photo
func DeleteMyPhoto(c *gin.Context) {
	userID := c.MustGet("user_id").(string)
	photoID := c.Param("id")

	log.Printf("Attempting to delete photo. UserID: %s, PhotoID: %s", userID, photoID)

	// Convert string IDs to ObjectIDs
	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Printf("Error converting userID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	photoObjID, err := primitive.ObjectIDFromHex(photoID)
	if err != nil {
		log.Printf("Error converting photoID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid photo ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// First check if the photo exists and belongs to the user
	var photo models.GalleryPost
	err = config.DB.Collection("gallery_posts").FindOne(ctx, bson.M{
		"_id": photoObjID,
	}).Decode(&photo)

	if err != nil {
		log.Printf("Error finding photo: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Photo not found"})
		return
	}

	// Verify ownership
	if photo.UserID != userObjID {
		log.Printf("Unauthorized deletion attempt. Photo belongs to %s", photo.UserID.Hex())
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to delete this photo"})
		return
	}

	// Delete the photo
	result, err := config.DB.Collection("gallery_posts").DeleteOne(ctx, bson.M{
		"_id": photoObjID,
	})

	if err != nil {
		log.Printf("Error deleting photo: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete photo: %v", err)})
		return
	}

	if result.DeletedCount == 0 {
		log.Printf("No photo was deleted. DeletedCount: %d", result.DeletedCount)
		c.JSON(http.StatusNotFound, gin.H{"error": "Photo could not be deleted"})
		return
	}

	log.Printf("Photo deleted successfully. PhotoID: %s", photoID)
	c.JSON(http.StatusOK, gin.H{"message": "Photo deleted successfully"})
}
