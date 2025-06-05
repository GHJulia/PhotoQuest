package controllers

import (
	"context"
	"net/http"
	"photoquest/config"
	"photoquest/models"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetLeaderboard(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "total_score", Value: -1}})
	findOptions.SetProjection(bson.M{
		"username":    1,
		"avatar_url":  1,
		"total_score": 1,
	})

	// Add filter to exclude admin users
	filter := bson.M{
		"role": bson.M{
			"$ne": "admin", // exclude users where role is "admin"
		},
	}

	cursor, err := config.DB.Collection("users").Find(ctx, filter, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch leaderboard"})
		return
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err := cursor.All(ctx, &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Decode error"})
		return
	}

	var leaderboard []gin.H
	for i, user := range users {
		leaderboard = append(leaderboard, gin.H{
			"rank":        i + 1,
			"username":    user.Username,
			"avatar_url":  user.AvatarURL,
			"total_score": user.TotalScore,
		})
	}

	c.JSON(http.StatusOK, leaderboard)
}
