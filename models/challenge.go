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

type CustomChallenge struct {
    Email        string   `bson:"email" json:"email"`
    ImageURL     string   `bson:"image_url" json:"image_url"`
    Choices      []string `bson:"choices" json:"choices"`
    CorrectIndex int      `bson:"correct_index" json:"correct_index"` // 0-3
    CreatedAt    string   `bson:"created_at" json:"created_at"`
}
