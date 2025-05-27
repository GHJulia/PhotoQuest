package utils

import (
    "github.com/golang-jwt/jwt/v5"
    "os"
    "time"
)

func GenerateJWT(userID, username, avatar string) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id":  userID,
        "username": username,
        "avatar":   avatar,
        "exp":      time.Now().Add(24 * time.Hour).Unix(),
    })

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