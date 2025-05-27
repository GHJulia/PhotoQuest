package controllers

import (
	"context"
    "fmt"
    "net/http"
	"math/rand"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"photoquest/config"
	"photoquest/models"
    "photoquest/utils"
)

// RollChallenge
// GET /challenge/roll?mode=easy
func RollChallenge(c *gin.Context) {
	mode := c.Query("mode")
	if mode == "" {
		c.JSON(400, gin.H{"error": "Missing mode"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Fetch all challenges in the given mode
	challengesCol := config.DB.Collection("challenges")
	cursor, err := challengesCol.Find(ctx, bson.M{"mode": mode})
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch challenges"})
		return
	}

	var challenges []models.Challenge
	if err := cursor.All(ctx, &challenges); err != nil || len(challenges) == 0 {
		c.JSON(500, gin.H{"error": "No challenges available"})
		return
	}

	random := challenges[rand.Intn(len(challenges))]
	c.JSON(200, random)
}

// AcceptChallenge
// POST /challenge/accept
func AcceptChallenge(c *gin.Context) {
	var req models.UserChallenge
	if err := c.BindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input"})
		return
	}

	// Normalize
	req.Email = strings.ToLower(req.Email)
	req.Date = time.Now().Format("2006-01-02")
	req.Status = "accepted"

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userChallenges := config.DB.Collection("user_challenges")

	// ❗ Check for existing challenge with the same prompt today
	duplicateFilter := bson.M{
		"email":  req.Email,
		"date":   req.Date,
		"prompt": req.Prompt,
	}
	dupCount, err := userChallenges.CountDocuments(ctx, duplicateFilter)
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	if dupCount > 0 {
		c.JSON(409, gin.H{"error": "You already accepted this challenge today"})
		return
	}

	// ❗ Check if user has accepted more than 5 challenges today
	limitFilter := bson.M{
		"email":  req.Email,
		"date":   req.Date,
		"status": "accepted",
	}
	count, err := userChallenges.CountDocuments(ctx, limitFilter)
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}
	if count >= 5 {
		c.JSON(403, gin.H{"error": "You’ve already accepted 5 challenges today"})
		return
	}

	// Insert new challenge
	_, err = userChallenges.InsertOne(ctx, req)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to save challenge"})
		return
	}

	c.JSON(200, gin.H{"message": "Challenge accepted"})
}

// UploadCustomChallenge
// POST /challenge/upload
func UploadCustomChallenge(c *gin.Context) {
	email := c.PostForm("email")
	correctIndex := c.PostForm("correct_index")
	choices := []string{
		c.PostForm("choice1"),
		c.PostForm("choice2"),
		c.PostForm("choice3"),
		c.PostForm("choice4"),
	}

    // ❗ Validate choices (must not be empty)
	for i, choice := range choices {
		if strings.TrimSpace(choice) == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("choice%d is required", i+1)})
			return
		}
	}

	// Get uploaded file
	header, err := c.FormFile("photo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read uploaded photo"})
		return
	}
	src, _ := header.Open()
	defer src.Close()

	// Upload to S3
	imageURL, err := utils.UploadToS3(src, header)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload to S3", "detail": err.Error()})
		return
	}

	// Validate correct_index
	var correctIdx int
	fmt.Sscanf(correctIndex, "%d", &correctIdx)
	if correctIdx < 0 || correctIdx > 3 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid correct_index"})
		return
	}

	// Create custom challenge document
	challenge := models.CustomChallenge{
		Email:        strings.ToLower(email),
		ImageURL:     imageURL,
		Choices:      choices,
		CorrectIndex: correctIdx,
		CreatedAt:    time.Now().Format(time.RFC3339),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = config.DB.Collection("custom_challenges").InsertOne(ctx, challenge)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database insert failed"})
		return
	}

	// ✅ Insert into gallery_posts using JWT user data
	gallery := models.GalleryPost{
		UserID:       fmt.Sprintf("%v", userID),
		UserName:     fmt.Sprintf("%v", username),
		UserAvatar:   fmt.Sprintf("%v", avatar),
		ImageURL:     imageURL,
		Choices:      choices,
		CorrectIndex: correctIdx,
		Likes:        []string{},
		CreatedAt:    time.Now(),
	}

	_, err = config.DB.Collection("gallery_posts").InsertOne(ctx, gallery)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save to gallery"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Custom challenge uploaded successfully"})
}