package controllers

import (
	"context"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"

	"photoquest/config"
	"photoquest/models"
	"photoquest/utils"
)

// Sign Up
func SignUp(c *gin.Context) {
	var req struct {
		Name     string `json:"name"`
		Surname  string `json:"surname"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	name := req.Name
	surname := req.Surname
	username := req.Username
	email := req.Email
	password := req.Password

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

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to hash password"})
		return
	}

	newUser := models.User{
		Name:       name,
		Surname:    surname,
		Username:   username,
		Email:      email,
		Password:   string(hashed),
		Verified:   false,
		AvatarURL:  "",
		TotalScore: 0,
		Role:       "user",
	}

	res, err := usersCollection.InsertOne(ctx, newUser)
	if err != nil {
		fmt.Println("❌ Failed to insert user:", err)
		c.JSON(500, gin.H{"error": "Failed to create user"})
		return
	}
	fmt.Println("✅ User inserted:", res.InsertedID)

	// ลบ OTP เก่าก่อน
	_, err = config.DB.Collection("otps").DeleteMany(ctx, bson.M{"email": email})
	if err != nil {
		fmt.Println("Failed to delete old OTP:", err)
		// ไม่ต้อง return ให้ส่ง OTP ใหม่ต่อ
	}

	otp := utils.GenerateOTP()

	_, err = config.DB.Collection("otps").InsertOne(ctx, models.OTP{
		Email: email,
		Code:  otp,
	})
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to save OTP"})
		return
	}

	err = utils.SendEmail(email, "Your OTP Code", fmt.Sprintf("Your OTP code is: %s", otp))
	if err != nil {
		fmt.Println("❌ Failed to send OTP email:", err)
		// ไม่ต้อง return error
	}

	c.JSON(200, gin.H{"message": "OTP sent to email"})
}

// Verify OTP
func VerifyOTP(c *gin.Context) {
	var req struct {
		Email           string `json:"email"`
		Code            string `json:"code"`
		IsPasswordReset bool   `json:"isPasswordReset"`
	}
	if err := c.BindJSON(&req); err != nil {
		fmt.Println("BindJSON error:", err)
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}
	fmt.Println("VerifyOTP received:", req.Email, req.Code)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	otpsCollection := config.DB.Collection("otps")
	usersCollection := config.DB.Collection("users")

	var otp models.OTP
	err := otpsCollection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&otp)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid OTP"})
		return
	}

	// Check if OTP has expired (3 minutes)
	if time.Since(otp.CreatedAt) > 3*time.Minute {
		// Delete expired OTP
		_, _ = otpsCollection.DeleteOne(ctx, bson.M{"email": req.Email})
		c.JSON(400, gin.H{"error": "OTP has expired. Please request a new one."})
		return
	}

	if otp.Code != req.Code {
		c.JSON(400, gin.H{"error": "Invalid OTP"})
		return
	}

	// For email verification, update user status
	if !req.IsPasswordReset {
		_, err = usersCollection.UpdateOne(ctx,
			bson.M{"email": req.Email},
			bson.M{"$set": bson.M{"verified": true}},
		)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to update user status"})
			return
		}
		// Delete used OTP after email verification
		_, _ = otpsCollection.DeleteOne(ctx, bson.M{"email": req.Email})
		c.JSON(200, gin.H{"message": "OTP verified"})
		return
	}

	// For password reset, generate a reset token
	resetToken, err := utils.GenerateJWT(req.Email, "", "", "", req.Email)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate reset token"})
		return
	}

	// Delete used OTP after generating reset token
	_, _ = otpsCollection.DeleteOne(ctx, bson.M{"email": req.Email})

	c.JSON(200, gin.H{
		"message": "OTP verified",
		"token":   resetToken,
	})
}

// Login
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

	token, _ := utils.GenerateJWT(user.ID.Hex(), user.Username, user.AvatarURL, user.Role, user.Email)
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
	if err := c.BindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if user exists
	var user models.User
	err := config.DB.Collection("users").FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		c.JSON(400, gin.H{"error": "User not found"})
		return
	}

	// Delete any existing OTP for this email
	_, err = config.DB.Collection("otps").DeleteMany(ctx, bson.M{"email": req.Email})
	if err != nil {
		fmt.Println("Failed to delete old OTP:", err)
		// Continue to send new OTP
	}

	otp := utils.GenerateOTP()

	// Save new OTP with creation time
	_, err = config.DB.Collection("otps").InsertOne(ctx, models.OTP{
		Email:     req.Email,
		Code:      otp,
		CreatedAt: time.Now(),
	})
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to save OTP"})
		return
	}

	err = utils.SendEmail(req.Email, "Your OTP Code", fmt.Sprintf("Your OTP code is: %s\nThis code will expire in 3 minutes.", otp))
	if err != nil {
		fmt.Println("❌ Failed to send OTP email:", err)
		// Continue without returning error
	}

	c.JSON(200, gin.H{"message": "OTP sent to email"})
}

// Reset Password
func ResetPassword(c *gin.Context) {
	var req struct {
		Email       string `json:"email"`
		NewPassword string `json:"newPassword"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	// Get email from JWT token
	claims, exists := c.Get("claims")
	if !exists {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}
	tokenEmail := claims.(jwt.MapClaims)["email"].(string)

	// Verify email matches token
	if req.Email != tokenEmail {
		c.JSON(401, gin.H{"error": "Invalid reset token"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if user exists
	var user models.User
	usersCollection := config.DB.Collection("users")
	err := usersCollection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		c.JSON(400, gin.H{"error": "User not found"})
		return
	}

	// Hash and update password
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to hash password"})
		return
	}

	_, err = usersCollection.UpdateOne(ctx,
		bson.M{"email": req.Email},
		bson.M{"$set": bson.M{"password": string(hashed)}},
	)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(200, gin.H{"message": "Password reset successful"})
}
