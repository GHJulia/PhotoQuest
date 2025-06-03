package controllers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"photoquest/config"
	"photoquest/models"
	"photoquest/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

// Photo Detail Page: Get each post id that user click to show only one
// GET /gallery/post/:id
func GetGalleryPostByID(c *gin.Context) {
	postID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(postID)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid post ID"})
		return
	}

	var post models.GalleryPost
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = config.DB.Collection("gallery_posts").FindOne(ctx, bson.M{"_id": objectID}).Decode(&post)
	if err != nil {
		c.JSON(404, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(200, gin.H{
		"id":            post.ID.Hex(),
		"user_id":       post.UserID.Hex(),
		"user_name":     post.UserName,
		"user_avatar":   post.UserAvatar,
		"image_url":     post.ImageURL,
		"created_at":    post.CreatedAt.Format("2006-01-02 15:04"),
		"choices":       post.Choices,
		"likes_count":   len(post.Likes),
		"correct_index": post.CorrectIndex, // optional: omit if frontend handles this only on submit
	})
}

// Photo Detail Page: Multiple choice answer of each user
// POST /gallery/answer
func SubmitAnswer(c *gin.Context) {
	type AnswerRequest struct {
		PostID string `json:"post_id"`
		UserID string `json:"user_id"`
		Answer string `json:"answer"`
	}

	var req AnswerRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input"})
		return
	}

	// Convert IDs
	postOID, err := primitive.ObjectIDFromHex(req.PostID)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid post ID"})
		return
	}
	userOID, err := primitive.ObjectIDFromHex(req.UserID)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid user ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find gallery post
	var post models.GalleryPost
	err = config.DB.Collection("gallery_posts").FindOne(ctx, bson.M{"_id": postOID}).Decode(&post)
	if err != nil {
		c.JSON(404, gin.H{"error": "Post not found"})
		return
	}

	// Check if already answered
	count, _ := config.DB.Collection("user_answers").CountDocuments(ctx, bson.M{
		"user_id": userOID,
		"post_id": postOID,
	})
	if count > 0 {
		c.JSON(409, gin.H{"error": "You already answered this post"})
		return
	}

	// Evaluate answer
	isCorrect := post.Choices[post.CorrectIndex] == req.Answer

	// Save answer attempt
	answer := models.UserAnswer{
		UserID:     userOID,
		PostID:     postOID,
		Answer:     req.Answer,
		IsCorrect:  isCorrect,
		AnsweredAt: time.Now().Unix(),
	}
	_, err = config.DB.Collection("user_answers").InsertOne(ctx, answer)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to save answer"})
		return
	}

	// Award point if correct
	if isCorrect {
		_, _ = config.DB.Collection("users").UpdateByID(ctx, userOID, bson.M{"$inc": bson.M{"score": 20}})
	}

	c.JSON(200, gin.H{
		"correct":       isCorrect,
		"correctAnswer": post.Choices[post.CorrectIndex],
		"message":       "Answer submitted",
	})
}
