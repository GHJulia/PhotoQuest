package models

type Challenge struct {
    Prompt string `bson:"prompt" json:"prompt"`
    Mode   string `bson:"mode" json:"mode"` // easy, medium, hard
}

type UserChallenge struct {
    Email  string `bson:"email" json:"email"`
    Date   string `bson:"date" json:"date"` // "YYYY-MM-DD"
    Prompt string `bson:"prompt" json:"prompt"`
    Mode   string `bson:"mode" json:"mode"`
    Status string `bson:"status" json:"status"` // accepted, skipped
}