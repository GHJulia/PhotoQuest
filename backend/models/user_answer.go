package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type UserAnswer struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID        primitive.ObjectID `bson:"user_id" json:"user_id"`
	PostID        primitive.ObjectID `bson:"post_id" json:"post_id"`
	SelectedIndex int                `bson:"selected_index" json:"selected_index"`
	Answer        string             `bson:"answer" json:"answer"`
	IsCorrect     bool               `bson:"is_correct" json:"is_correct"`
	Points        int                `bson:"points" json:"points"`
	AnsweredAt    int64              `bson:"answered_at" json:"answered_at"`
}
