package controllers

import (
	"context"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"photoquest/config"
	"photoquest/models"
	"photoquest/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Postman: All routes work fine สังสัยตรง uploadcustomchallenge นิดนึงตรงที่ gallery_post
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

	// Check for existing challenge with the same prompt today
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

	// Check if user has accepted more than 5 challenges today
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
		c.JSON(403, gin.H{
			"error":            "You've already accepted 5 challenges today",
			"daily_challenges": count,
			"max_challenges":   5,
		})
		return
	}

	// Insert new challenge
	_, err = userChallenges.InsertOne(ctx, req)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to save challenge"})
		return
	}

	// Get updated count after insertion
	newCount, _ := userChallenges.CountDocuments(ctx, limitFilter)

	c.JSON(200, gin.H{
		"message":              "Challenge accepted",
		"daily_challenges":     newCount,
		"max_challenges":       5,
		"remaining_challenges": 5 - newCount,
	})
}

// GetUserChallengeStatus
// GET /challenge/status
func GetUserChallengeStatus(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		c.JSON(400, gin.H{"error": "Missing email"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check current day's challenges
	today := time.Now().Format("2006-01-02")
	filter := bson.M{
		"email":  email,
		"date":   today,
		"status": "accepted",
	}

	count, err := config.DB.Collection("user_challenges").CountDocuments(ctx, filter)
	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}

	// Check if it's a new day and reset if needed
	if count == 0 {
		// Optional: You could clear old records here
		c.JSON(200, gin.H{
			"daily_challenges":     0,
			"max_challenges":       5,
			"remaining_challenges": 5,
			"is_reset":             true,
		})
		return
	}

	c.JSON(200, gin.H{
		"daily_challenges":     count,
		"max_challenges":       5,
		"remaining_challenges": 5 - count,
		"is_reset":             false,
	})
}

// UploadCustomChallenge
// POST /challenge/upload
func UploadCustomChallenge(c *gin.Context) {
	// Extract user claims from JWT (set by middleware)
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userClaims := claims.(jwt.MapClaims)

	userIDHex, ok := userClaims["user_id"].(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user_id"})
		return
	}
	userID, err := primitive.ObjectIDFromHex(userIDHex)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ObjectID"})
		return
	}

	// Get form values
	email := c.PostForm("email")
	correctIndex := c.PostForm("correct_index")
	prompt := c.PostForm("prompt")
	difficulty := c.PostForm("difficulty")
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

	// Get user data from database
	var user models.User
	err = config.DB.Collection("users").FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user data"})
		return
	}

	// ✅ Insert into gallery_posts using user data from database
	gallery := models.GalleryPost{
		UserID:       userID,
		UserName:     user.Username,
		UserAvatar:   user.AvatarURL,
		ImageURL:     imageURL,
		Choices:      choices,
		CorrectIndex: correctIdx,
		Prompt:       prompt,
		Difficulty:   difficulty,
		Likes:        []string{},
		CreatedAt:    time.Now(),
	}

	_, err = config.DB.Collection("gallery_posts").InsertOne(ctx, gallery)
	if err != nil {
		fmt.Println("Gallery insert error:", err)
		fmt.Println("Gallery data:", gallery)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gallery insert failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Custom challenge uploaded successfully"})
}

// GetProgress
// GET /challenge/progress?email=user@example.com&date=2024-03-20
func GetProgress(c *gin.Context) {
	email := c.Query("email")
	date := c.Query("date")

	if email == "" || date == "" {
		c.JSON(400, gin.H{"error": "Missing email or date"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userChallenges := config.DB.Collection("user_challenges")
	count, err := userChallenges.CountDocuments(ctx, bson.M{
		"email":  email,
		"date":   date,
		"status": "accepted",
	})

	if err != nil {
		c.JSON(500, gin.H{"error": "Database error"})
		return
	}

	c.JSON(200, gin.H{"completed": count})
}

// SubmitChallenge
// POST /challenge/submit
func SubmitChallenge(c *gin.Context) {
	// Extract user claims from JWT (set by middleware)
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userClaims := claims.(jwt.MapClaims)

	userIDHex, ok := userClaims["user_id"].(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user_id"})
		return
	}
	userID, err := primitive.ObjectIDFromHex(userIDHex)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ObjectID"})
		return
	}

	username := userClaims["username"].(string)
	avatar := userClaims["avatar"].(string)

	// Get form values
	task := c.PostForm("task")
	difficulty := c.PostForm("difficulty")

	if task == "" || difficulty == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing task or difficulty"})
		return
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

	// Create gallery post
	gallery := models.GalleryPost{
		UserID:     userID,
		UserName:   username,
		UserAvatar: avatar,
		ImageURL:   imageURL,
		Task:       task,
		Difficulty: difficulty,
		Likes:      []string{},
		CreatedAt:  time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = config.DB.Collection("gallery_posts").InsertOne(ctx, gallery)
	if err != nil {
		fmt.Println("Gallery insert error:", err)
		fmt.Println("Gallery data:", gallery)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gallery insert failed"})
		return
	}

	// Update user_challenges status to completed
	filter := bson.M{
		"email":  userClaims["email"].(string),
		"prompt": task,
		"mode":   difficulty,
		"date":   time.Now().Format("2006-01-02"),
	}
	update := bson.M{
		"$set": bson.M{
			"status":    "completed",
			"image_url": imageURL,
		},
	}
	_, err = config.DB.Collection("user_challenges").UpdateOne(ctx, filter, update)
	if err != nil {
		fmt.Println("Failed to update challenge status:", err)
		// Don't return error to user since the submission was successful
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Challenge completed successfully",
		"points":  100,
	})
}

// GetGuessChallenge
// GET /challenge/guess/:id
func GetGuessChallenge(c *gin.Context) {
	id := c.Param("id")
	postID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid challenge ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var post models.GalleryPost
	err = config.DB.Collection("gallery_posts").FindOne(ctx, bson.M{"_id": postID}).Decode(&post)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Challenge not found"})
		return
	}

	// Return challenge data
	c.JSON(http.StatusOK, gin.H{
		"id":            post.ID.Hex(),
		"image_url":     post.ImageURL,
		"prompt":        post.Prompt,
		"choices":       post.Choices,
		"correct_index": post.CorrectIndex,
		"difficulty":    post.Difficulty,
		"points":        100,
		"created_at":    post.CreatedAt.Format(time.RFC3339),
		"author":        post.UserName,
	})
}

// SubmitGuessChallenge
// POST /challenge/guess/submit
func SubmitGuessChallenge(c *gin.Context) {
	// Extract user claims from JWT
	claims, exists := c.Get("claims")
	if !exists {
		fmt.Println("No JWT claims found")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userClaims := claims.(jwt.MapClaims)
	fmt.Printf("User claims: %+v\n", userClaims)

	// Parse request
	var req struct {
		ChallengeID   string `json:"challenge_id"`
		SelectedIndex int    `json:"selected_index"`
		Email         string `json:"email"`
	}
	if err := c.BindJSON(&req); err != nil {
		fmt.Printf("Error binding JSON: %v\n", err)
		fmt.Printf("Request body: %v\n", c.Request.Body)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	fmt.Printf("Request data: %+v\n", req)

	// Validate email matches JWT
	if req.Email != userClaims["email"].(string) {
		fmt.Printf("Email mismatch - Request: %s, JWT: %s\n", req.Email, userClaims["email"])
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email mismatch"})
		return
	}

	// Get challenge from database
	postID, err := primitive.ObjectIDFromHex(req.ChallengeID)
	if err != nil {
		fmt.Printf("Error converting challenge ID: %v\n", err)
		fmt.Printf("Challenge ID received: %s\n", req.ChallengeID)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid challenge ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var post models.GalleryPost
	err = config.DB.Collection("gallery_posts").FindOne(ctx, bson.M{"_id": postID}).Decode(&post)
	if err != nil {
		fmt.Printf("Error finding post: %v\n", err)
		fmt.Printf("Looking for post ID: %s\n", postID.Hex())
		c.JSON(http.StatusNotFound, gin.H{"error": "Challenge not found"})
		return
	}

	fmt.Printf("Found post: %+v\n", post)

	// Check if user has already submitted an answer
	userID, err := primitive.ObjectIDFromHex(userClaims["user_id"].(string))
	if err != nil {
		fmt.Printf("Error converting user ID: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	count, err := config.DB.Collection("user_answers").CountDocuments(ctx, bson.M{
		"user_id": userID,
		"post_id": postID,
	})
	if err != nil {
		fmt.Printf("Error checking existing answers: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing answers"})
		return
	}
	if count > 0 {
		fmt.Printf("User %s has already answered challenge %s\n", userID.Hex(), postID.Hex())
		c.JSON(http.StatusConflict, gin.H{"error": "You have already submitted an answer for this challenge"})
		return
	}

	// Validate selected index
	if req.SelectedIndex < 0 || req.SelectedIndex >= len(post.Choices) {
		fmt.Printf("Invalid answer index: %d (choices length: %d)\n", req.SelectedIndex, len(post.Choices))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid answer index"})
		return
	}

	// Check answer
	isCorrect := req.SelectedIndex == post.CorrectIndex
	fmt.Printf("Answer check - Selected: %d, Correct: %d, IsCorrect: %v\n",
		req.SelectedIndex, post.CorrectIndex, isCorrect)

	// Save answer attempt
	answer := models.UserAnswer{
		UserID:     userID,
		PostID:     postID,
		Answer:     post.Choices[req.SelectedIndex],
		IsCorrect:  isCorrect,
		AnsweredAt: time.Now().Unix(),
	}

	_, err = config.DB.Collection("user_answers").InsertOne(ctx, answer)
	if err != nil {
		fmt.Printf("Error saving answer: %v\n", err)
		fmt.Printf("Attempted to save answer: %+v\n", answer)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save answer"})
		return
	}

	points := 0
	// Award points if correct based on difficulty
	if isCorrect {
		// Set points to 100 for all difficulty levels
		points = 100

		// Update user's total score
		_, err = config.DB.Collection("users").UpdateOne(ctx,
			bson.M{"_id": userID},
			bson.M{"$inc": bson.M{"total_score": points}},
		)
		if err != nil {
			fmt.Printf("Failed to update user score: %v\n", err)
			// Don't return error to user since the answer was saved successfully
		} else {
			fmt.Printf("Updated user %s score by %d points\n", userID.Hex(), points)
		}
	}

	// Get message based on correctness
	message := "Incorrect answer. Try again!"
	if isCorrect {
		message = fmt.Sprintf("Correct answer! You earned %d points!", points)
	}

	response := gin.H{
		"is_correct":     isCorrect,
		"points":         points,
		"message":        message,
		"answer":         post.Choices[req.SelectedIndex],
		"correct_answer": post.Choices[post.CorrectIndex],
	}
	fmt.Printf("Sending response: %+v\n", response)
	c.JSON(http.StatusOK, response)
}
