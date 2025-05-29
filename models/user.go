package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
    ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Name     string             `bson:"name" json:"name"`
    Surname   string            `bson:"surname" json:"surname"`
    Username  string             `bson:"username" json:"username"`
    Email    string             `bson:"email" json:"email"`
    Password string             `bson:"password" json:"-"`
    Verified bool               `bson:"verified" json:"verified"`
    Avatar   string             `bson:"avatar" json:"avatar"` // ✅ Add this line
    TotalScore int               `bson:"total_score" json:"total_score"`
}

