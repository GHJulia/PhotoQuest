package models

import (
	"context"
	"log"
	"time"

	"photoquest/config"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UserAnswer struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	UserID     primitive.ObjectID `bson:"user_id"`
	PostID     primitive.ObjectID `bson:"post_id"`
	Answer     string             `bson:"answer"`
	IsCorrect  bool               `bson:"is_correct"`
	AnsweredAt int64              `bson:"answered_at"`
}

// Initialize creates required indexes for the user_answers collection
func (ua *UserAnswer) Initialize() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Create a unique compound index on user_id and post_id
	// This ensures a user can only submit one answer per challenge
	unique := true
	uniqueIndex := mongo.IndexModel{
		Keys: bson.D{
			{Key: "user_id", Value: 1},
			{Key: "post_id", Value: 1},
		},
		Options: &options.IndexOptions{
			Unique: &unique,
		},
	}

	// Create an index on answered_at for querying recent answers
	timeIndex := mongo.IndexModel{
		Keys: bson.D{{Key: "answered_at", Value: -1}},
	}

	// Create indexes
	collection := config.DB.Collection("user_answers")

	_, err := collection.Indexes().CreateMany(ctx, []mongo.IndexModel{uniqueIndex, timeIndex})
	if err != nil {
		log.Printf("Failed to create indexes for user_answers: %v", err)
	}
}
