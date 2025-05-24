package models

type OTP struct {
    Email string `bson:"email"`
    Code  string `bson:"code"`
}
