package controllers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"photoquest/config"
	"photoquest/models"
	"photoquest/utils"
)

// Postman: it can post photo in gallery page now and also like and unlike
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

	// Convert PostID to ObjectID
	objectID, err := primitive.ObjectIDFromHex(req.PostID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post_id"})
		return
	}

	// Find post by ID
	var post models.GalleryPost
	err = postCol.FindOne(ctx, bson.M{"_id": objectID}).Decode(&post)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	var update bson.M
	liked := false
	for _, email := range post.Likes {
		if email == req.Email {
			liked = true
			break
		}
	}

	if liked {
		update = bson.M{"$pull": bson.M{"likes": req.Email}}
	} else {
		update = bson.M{"$addToSet": bson.M{"likes": req.Email}}
	}

	// Apply update
	_, err = postCol.UpdateByID(ctx, objectID, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Like toggle failed"})
		return
	}

	status := "liked"
	if liked {
		status = "unliked"
	}
	c.JSON(http.StatusOK, gin.H{"message": "Successfully " + status})
}

// Share Button
// POST /gallery/share
func ShareGalleryPost(c *gin.Context) {
    var req struct {
        PostID string `json:"post_id"`
        Email  string `json:"email"`
    }

    if err := c.BindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    // Convert to ObjectID
    objectID, err := primitive.ObjectIDFromHex(req.PostID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Post ID"})
        return
    }

    // Fetch the post
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    var post models.GalleryPost
    err = config.DB.Collection("gallery_posts").FindOne(ctx, bson.M{"_id": objectID}).Decode(&post)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
        return
    }

    // Compose shareable link
    shareURL := fmt.Sprintf("https://photoquest.site/gallery/%s", req.PostID)

    // Email content
    subject := "Check out this photo on PhotoQuest!"
    body := fmt.Sprintf("Hi there! 👋\n\nSomeone shared a photo with you!\nClick to view: %s", shareURL)

    // Send the email
    err = utils.SendEmail(req.Email, subject, body)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Share link sent to email"})
}