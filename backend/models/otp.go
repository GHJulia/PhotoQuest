package models

import "time"

type OTP struct {
	Email     string    `bson:"email"`
	Code      string    `bson:"code"`
	CreatedAt time.Time `bson:"created_at"`
}
