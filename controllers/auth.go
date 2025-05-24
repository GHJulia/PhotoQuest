package controllers

import (
    "github.com/gin-gonic/gin"
    "photoquest/database"
    "photoquest/models"
    "golang.org/x/crypto/bcrypt"
    "photoquest/utils"
)

// SignUp
func SignUp(c *gin.Context) {
    var req struct {
        Name     string `json:"name"`
        Email    string `json:"email"`
        Password string `json:"password"`
    }
    if err := c.BindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": "Invalid input"})
        return
    }

    if _, exists := database.Users[req.Email]; exists {
        c.JSON(400, gin.H{"error": "Email already exists"})
        return
    }

    hashed, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    user := models.User{
        Name:     req.Name,
        Email:    req.Email,
        Password: string(hashed),
        Verified: false,
    }

    database.Users[req.Email] = user

    otp := utils.GenerateOTP()
    database.OTPs[req.Email] = otp

    c.JSON(200, gin.H{"message": "OTP sent to email", "otp": otp})
}

// Verify OTP
func VerifyOTP(c *gin.Context) {
    var req struct {
        Email string `json:"email"`
        Code  string `json:"code"`
    }
    c.BindJSON(&req)

    if code, ok := database.OTPs[req.Email]; ok && code == req.Code {
        user := database.Users[req.Email]
        user.Verified = true
        database.Users[req.Email] = user
        delete(database.OTPs, req.Email)

        c.JSON(200, gin.H{"message": "Email verified"})
        return
    }

    c.JSON(400, gin.H{"error": "Invalid OTP"})
}

// Login
func Login(c *gin.Context) {
    var req struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }
    c.BindJSON(&req)

    user, ok := database.Users[req.Email]
    if !ok || !user.Verified {
        c.JSON(401, gin.H{"error": "User not found or not verified"})
        return
    }

    err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
    if err != nil {
        c.JSON(401, gin.H{"error": "Wrong password"})
        return
    }

    c.JSON(200, gin.H{"message": "Login successful"})
}

// Forgot Password (Send OTP)
func ForgotPassword(c *gin.Context) {
    var req struct {
        Email string `json:"email"`
    }
    c.BindJSON(&req)

    if _, ok := database.Users[req.Email]; !ok {
        c.JSON(404, gin.H{"error": "Email not found"})
        return
    }

    otp := utils.GenerateOTP()
    database.OTPs[req.Email] = otp

    c.JSON(200, gin.H{"message": "OTP sent", "otp": otp})
}

// Reset Password
func ResetPassword(c *gin.Context) {
    var req struct {
        Email       string `json:"email"`
        Code        string `json:"code"`
        NewPassword string `json:"newPassword"`
    }
    c.BindJSON(&req)

    if database.OTPs[req.Email] != req.Code {
        c.JSON(400, gin.H{"error": "Invalid OTP"})
        return
    }

    hashed, _ := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
    user := database.Users[req.Email]
    user.Password = string(hashed)
    database.Users[req.Email] = user

    delete(database.OTPs, req.Email)

    c.JSON(200, gin.H{"message": "Password reset successful"})
}