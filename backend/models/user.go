package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type UserStats struct {
	TotalPhotosUploaded int `bson:"total_photos_uploaded" json:"totalPhotosUploaded"`
	TotalLikesReceived  int `bson:"total_likes_received" json:"totalLikesReceived"`
}

type User struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name       string             `bson:"name" json:"name"`
	Surname    string             `bson:"surname" json:"surname"`
	Username   string             `bson:"username" json:"username"`
	Email      string             `bson:"email" json:"email"`
	Password   string             `bson:"password" json:"-"`
	Verified   bool               `bson:"verified" json:"verified"`
	AvatarURL  string             `bson:"avatar_url" json:"avatar_url"`
	TotalScore int                `bson:"total_score" json:"total_score"`
	Role       string             `bson:"role" json:"role"`
	Stats      *UserStats         `bson:"stats,omitempty" json:"stats,omitempty"`
}
