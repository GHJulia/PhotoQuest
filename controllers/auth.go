package controllers

import (
    "context"
    "fmt"
    "time"

    "github.com/gin-gonic/gin"
    "golang.org/x/crypto/bcrypt"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo/options"

    "photoquest/config"
    "photoquest/models"
    "photoquest/utils"
)
// Test in Postman: All route works: Accept for OTP doesn't save in database for real email but for example emails can why?
// Sign Up
// Sign Up
func SignUp(c *gin.Context) {
	name := c.PostForm("name")
	surname := c.PostForm("surname")
	username := c.PostForm("username")
	email := c.PostForm("email")
	password := c.PostForm("password")

	if name == "" || surname == "" || username == "" || email == "" || password == "" {
		c.JSON(400, gin.H{"error": "Missing required fields"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	usersCollection := config.DB.Collection("users")

	var existing models.User
	err := usersCollection.FindOne(ctx, bson.M{
		"$or": []bson.M{
			{"email": email},
			{"username": username},
		},
	}).Decode(&existing)

	if err == nil {
		c.JSON(400, gin.H{"error": "Email or username already exists"})
		return
	}

	hashed, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	newUser := models.User{
		Name:       name,
		Surname:    surname,
		Username:   username,
		Email:      email,
		Password:   string(hashed),
		Verified:   false,
		Avatar:     "", // can later be updated via profile page
		TotalScore: 0,
        Role:       "user",
	}

	_, err = usersCollection.InsertOne(ctx, newUser)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create user"})
		return
	}

	otp := utils.GenerateOTP()
	_, _ = config.DB.Collection("otps").InsertOne(ctx, models.OTP{
		Email: email,
		Code:  otp,
	})

	utils.SendEmail(email, "Your OTP Code", fmt.Sprintf("Your OTP code is: %s", otp))

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
// Login (email OR username)
func Login(c *gin.Context) {
	var req struct {
		Identifier string `json:"identifier"` // email or username
		Password   string `json:"password"`
	}
	c.BindJSON(&req)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	usersCollection := config.DB.Collection("users")

	var user models.User
	err := usersCollection.FindOne(ctx, bson.M{
		"$or": []bson.M{
			{"email": req.Identifier},
			{"username": req.Identifier},
		},
	}).Decode(&user)

	if err != nil || !user.Verified {
		c.JSON(401, gin.H{"error": "User not found or not verified"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		c.JSON(401, gin.H{"error": "Wrong password"})
		return
	}

	token, _ := utils.GenerateJWT(user.ID.Hex(), user.Username, user.Avatar, user.Role)
	c.JSON(200, gin.H{
		"message": "Login successful",
		"token":   token,
	})
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

    subject := "Reset Your Password"
    body := fmt.Sprintf("Your OTP for resetting password is: %s", otp)
    utils.SendEmail(req.Email, subject, body)

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
