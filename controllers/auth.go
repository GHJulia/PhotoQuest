package controllers

import (
    "context"
    "time"

    "github.com/gin-gonic/gin"
    "golang.org/x/crypto/bcrypt"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo/options"

    "photoquest/config"
    "photoquest/models"
    "photoquest/utils"
)

// Sign Up
func SignUp(c *gin.Context) {
	name := c.PostForm("name")
	email := c.PostForm("email")
	password := c.PostForm("password")

	// Validate input
	if name == "" || email == "" || password == "" {
		c.JSON(400, gin.H{"error": "Missing required fields"})
		return
	}

	// Check for existing user
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	usersCollection := config.DB.Collection("users")

	var existingUser models.User
	err := usersCollection.FindOne(ctx, bson.M{"email": email}).Decode(&existingUser)
	if err == nil {
		c.JSON(400, gin.H{"error": "Email already exists"})
		return
	}

	// Hash password
	hashed, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	// Handle avatar upload
	var avatarURL string
	fileHeader, err := c.FormFile("avatar")
	if err == nil {
		src, _ := fileHeader.Open()
		defer src.Close()
		avatarURL, err = utils.UploadToS3(src, fileHeader)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to upload avatar", "detail": err.Error()})
			return
		}
	} else {
		avatarURL = "https://your-default-avatar-url.com/default.png"
	}

	// Insert new user
	newUser := models.User{
		Name:     name,
		Email:    email,
		Password: string(hashed),
		Avatar:   avatarURL,
		Verified: false,
	}
	_, err = usersCollection.InsertOne(ctx, newUser)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create user"})
		return
	}

	// Send OTP
	otp := utils.GenerateOTP()
	_, _ = config.DB.Collection("otps").InsertOne(ctx, models.OTP{
		Email: email,
		Code:  otp,
	})
	utils.SendEmail(email, otp)

	c.JSON(200, gin.H{"message": "OTP sent to email"})
}

// Verify OTP
func VerifyOTP(c *gin.Context) {
    var req struct {
        Email string `json:"email"`
        Code  string `json:"code"`
    }
    c.BindJSON(&req)

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    otpsCollection := config.DB.Collection("otps")
    usersCollection := config.DB.Collection("users")

    var otp models.OTP
    err := otpsCollection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&otp)
    if err != nil || otp.Code != req.Code {
        c.JSON(400, gin.H{"error": "Invalid OTP"})
        return
    }

    _, err = usersCollection.UpdateOne(ctx,
        bson.M{"email": req.Email},
        bson.M{"$set": bson.M{"verified": true}},
    )
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to update user status"})
        return
    }

    _, _ = otpsCollection.DeleteOne(ctx, bson.M{"email": req.Email})
    c.JSON(200, gin.H{"message": "Email verified"})
}

// Login
func Login(c *gin.Context) {
    var req struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }
    c.BindJSON(&req)

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    usersCollection := config.DB.Collection("users")

    var user models.User
    err := usersCollection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
    if err != nil || !user.Verified {
        c.JSON(401, gin.H{"error": "User not found or not verified"})
        return
    }

    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
    if err != nil {
        c.JSON(401, gin.H{"error": "Wrong password"})
        return
    }

    token, _ := utils.GenerateJWT(user.ID.Hex(), user.Name, user.Avatar)
    c.JSON(200, gin.H{"message": "Login successful", "token": token})
}

// Forgot Password (Send OTP)
func ForgotPassword(c *gin.Context) {
    var req struct {
        Email string `json:"email"`
    }
    c.BindJSON(&req)

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    usersCollection := config.DB.Collection("users")
    otpsCollection := config.DB.Collection("otps")

    var user models.User
    err := usersCollection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
    if err != nil {
        c.JSON(404, gin.H{"error": "Email not found"})
        return
    }

    otp := utils.GenerateOTP()
    _, err = otpsCollection.UpdateOne(ctx,
        bson.M{"email": req.Email},
        bson.M{"$set": bson.M{"code": otp}},
        options.Update().SetUpsert(true),
    )
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to save OTP"})
        return
    }

    utils.SendEmail(req.Email, otp)
    c.JSON(200, gin.H{"message": "OTP sent to email"})
}

// Reset Password
func ResetPassword(c *gin.Context) {
    var req struct {
        Email       string `json:"email"`
        Code        string `json:"code"`
        NewPassword string `json:"newPassword"`
    }
    c.BindJSON(&req)

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    otpsCollection := config.DB.Collection("otps")
    usersCollection := config.DB.Collection("users")

    var otp models.OTP
    err := otpsCollection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&otp)
    if err != nil || otp.Code != req.Code {
        c.JSON(400, gin.H{"error": "Invalid OTP"})
        return
    }

    hashed, _ := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
    _, err = usersCollection.UpdateOne(ctx,
        bson.M{"email": req.Email},
        bson.M{"$set": bson.M{"password": string(hashed)}},
    )
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to update password"})
        return
    }

    _, _ = otpsCollection.DeleteOne(ctx, bson.M{"email": req.Email})
    c.JSON(200, gin.H{"message": "Password reset successful"})
}
