package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type UserAnswer struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	UserID     primitive.ObjectID `bson:"user_id"`
	PostID     primitive.ObjectID `bson:"post_id"`
	Answer     string             `bson:"answer"`
	IsCorrect  bool               `bson:"is_correct"`
	AnsweredAt int64              `bson:"answered_at"`
}
