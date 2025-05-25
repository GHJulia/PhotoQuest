package controllers

import (
    "context"
    "math/rand"
    "time"
    "fmt"
    "strings"

    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
    "photoquest/config"
    "photoquest/models"
)

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
    count, _ := uc.CountDocuments(ctx, bson.M{
        "email":  email,
        "date":   today,
        "status": bson.M{"$in": []string{"rolled", "accepted", "skipped"}},
    })

    if count >= 5 {
        c.JSON(403, gin.H{"error": "Daily challenge limit reached"})
        return
    }

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

    picked := challenges[rand.Intn(len(challenges))]

    // Record that it was rolled
    _, _ = uc.InsertOne(ctx, models.UserChallenge{
        Email:  email,
        Date:   today,
        Prompt: picked.Prompt,
        Mode:   picked.Mode,
        Status: "rolled",
    })

    c.JSON(200, picked)
}


// Accept the Challenge
func AcceptChallenge(c *gin.Context) {
    var req models.UserChallenge
    if err := c.BindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": "Invalid input"})
        return
    }
    req.Email = strings.ToLower(req.Email)
    req.Date = time.Now().Format("2006-01-02")
    req.Status = "accepted"

     fmt.Printf("📝 Saving Challenge: %+v\n", req) // Add this

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    userChallenges := config.DB.Collection("user_challenges")
	 filter := bson.M{
        "email":  req.Email,
        "date":   req.Date,
        "status": "accepted",
    }

    fmt.Printf("🔍 Filter: %+v\n", filter)
    count, err := userChallenges.CountDocuments(ctx, filter)
    if err != nil {
        c.JSON(500, gin.H{"error": "Database error", "detail": err.Error()})
        return
    }

    fmt.Printf("📊 Accepted today: %d\n", count)
    if count >= 5 {
        c.JSON(403, gin.H{"error": "You’ve already accepted 5 challenges today"})
        return
    }

    _, err = userChallenges.InsertOne(ctx, req)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to save challenge", "detail": err.Error()})
        return
    }

    c.JSON(200, gin.H{"message": "Challenge accepted"})
}