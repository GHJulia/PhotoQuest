package utils

import (
    "github.com/golang-jwt/jwt/v5"
    "os"
    "time"
)

// GenerateJWT creates a JWT token containing user_id, username, avatar, and role
func GenerateJWT(userID, username, avatar, role string) (string, error) {
    claims := jwt.MapClaims{
        "user_id":  userID,
        "username": username,
        "avatar":   avatar,
        "role":     role,
        "exp":      time.Now().Add(24 * time.Hour).Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

/*package utils

import (
    "github.com/golang-jwt/jwt/v5"
    "os"
    "time"
)

func GenerateJWT(email string) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "email": email,
        "exp":   time.Now().Add(24 * time.Hour).Unix(),
    })

    return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}*/