package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Challenge struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Prompt    string             `bson:"prompt" json:"prompt"`
	Mode      string             `bson:"mode" json:"mode"` // easy, medium, hard
	Points    int                `bson:"points" json:"points"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	Status    string             `bson:"status" json:"status"` // active/inactive
}

type UserChallenge struct {
	Email  string    `bson:"email" json:"email"`
	Date   time.Time `bson:"date" json:"date"`
	Prompt string    `bson:"prompt" json:"prompt"`
	Mode   string    `bson:"mode" json:"mode"`
	Status string    `bson:"status" json:"status"` // accepted, skipped
}

type CustomChallenge struct {
	Email        string    `bson:"email" json:"email"`
	ImageURL     string    `bson:"image_url" json:"image_url"`
	Choices      []string  `bson:"choices" json:"choices"`
	CorrectIndex int       `bson:"correct_index" json:"correct_index"` // 0-3
	CreatedAt    time.Time `bson:"created_at" json:"created_at"`
}
