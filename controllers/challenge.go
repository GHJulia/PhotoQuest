package controllers

import (
    "context"
    "math/rand"
    "time"

    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
    "photoquest/config"
    "photoquest/models"
)

// Random the Challenge
func RollChallenge(c *gin.Context) {
    mode := c.Query("mode") // easy, medium, hard
    email := c.Query("email")

    if mode == "" || email == "" {
        c.JSON(400, gin.H{"error": "Missing mode or email"})
        return
    }

    today := time.Now().Format("2006-01-02")
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    uc := config.DB.Collection("user_challenges")
    count, _ := uc.CountDocuments(ctx, bson.M{"email": email, "date": today})

    if count >= 5 {
        c.JSON(403, gin.H{"error": "Daily challenge limit reached"})
        return
    }

    // get all prompts for that mode
    challengesCol := config.DB.Collection("challenges")
    cursor, err := challengesCol.Find(ctx, bson.M{"mode": mode})
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to fetch prompts"})
        return
    }

    var challenges []models.Challenge
    if err := cursor.All(ctx, &challenges); err != nil || len(challenges) == 0 {
        c.JSON(500, gin.H{"error": "No prompts available"})
        return
    }

    // pick one randomly
    picked := challenges[rand.Intn(len(challenges))]

    c.JSON(200, picked)
}

// Accept the Challenge
func AcceptChallenge(c *gin.Context) {
    var req models.UserChallenge
    if err := c.BindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": "Invalid input"})
        return
    }
    req.Date = time.Now().Format("2006-01-02")
    req.Status = "accepted"

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    _, err := config.DB.Collection("user_challenges").InsertOne(ctx, req)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to save challenge"})
        return
    }

    c.JSON(200, gin.H{"message": "Challenge accepted"})
}

// Skip the Challenge
func SkipChallenge(c *gin.Context) {
    var req models.UserChallenge
    if err := c.BindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": "Invalid input"})
        return
    }
    req.Date = time.Now().Format("2006-01-02")
    req.Status = "skipped"

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    _, err := config.DB.Collection("user_challenges").InsertOne(ctx, req)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to save skipped challenge"})
        return
    }

    c.JSON(200, gin.H{"message": "Challenge skipped"})
}