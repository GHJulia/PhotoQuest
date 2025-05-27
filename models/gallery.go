package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type GalleryPost struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID       primitive.ObjectID `bson:"user_id" json:"user_id"`
	UserName     string             `bson:"user_name" json:"user_name"`
	UserAvatar   string             `bson:"user_avatar" json:"user_avatar"`
	ImageURL     string             `bson:"image_url" json:"image_url"`
	Choices      []string           `bson:"choices" json:"choices"`
	CorrectIndex int                `bson:"correct_index" json:"correct_index"`
	Likes        []string           `bson:"likes" json:"likes"`
	CreatedAt    time.Time          `bson:"created_at" json:"created_at"`
}