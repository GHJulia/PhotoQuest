package controllers

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"

	"photoquest/config"
	"photoquest/models"
)

func GetProfile(c *gin.Context) {
	userID := c.MustGet("user_id").(string)
	objID, _ := primitive.ObjectIDFromHex(userID)

	ctx := context.TODO()

	// Get user data
	var user models.User
	err := config.DB.Collection("users").FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	// Calculate total photos uploaded
	photosCount, err := config.DB.Collection("gallery_posts").CountDocuments(ctx, bson.M{"user_id": objID})
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to count photos"})
		return
	}

	// Calculate total likes received
	cursor, err := config.DB.Collection("gallery_posts").Find(ctx, bson.M{"user_id": objID})
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch posts"})
		return
	}
	defer cursor.Close(ctx)

	var totalLikes int
	var posts []models.GalleryPost
	if err = cursor.All(ctx, &posts); err != nil {
		c.JSON(500, gin.H{"error": "Failed to parse posts"})
		return
	}

	for _, post := range posts {
		totalLikes += len(post.Likes)
	}

	// Update user stats
	user.Stats = &models.UserStats{
		TotalPhotosUploaded: int(photosCount),
		TotalLikesReceived:  totalLikes,
	}

	// Update stats in database
	_, err = config.DB.Collection("users").UpdateByID(ctx, objID, bson.M{
		"$set": bson.M{"stats": user.Stats},
	})
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update stats"})
		return
	}

	user.Password = "" // hide password
	c.JSON(http.StatusOK, user)
}

func UpdateProfile(c *gin.Context) {
	userID := c.MustGet("user_id").(string)
	objID, _ := primitive.ObjectIDFromHex(userID)

	// Get current user data
	var currentUser models.User
	err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&currentUser)
	if err != nil {
		c.JSON(404, gin.H{"error": "ไม่พบข้อมูลผู้ใช้"})
		return
	}

	// Bind request data
	var req struct {
		Name            string `json:"name"`
		Surname         string `json:"surname"`
		Username        string `json:"username"`
		Email           string `json:"email"`
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	// Validate required fields
	if req.Name == "" || req.Surname == "" || req.Username == "" || req.Email == "" {
		c.JSON(400, gin.H{"error": "กรุณากรอกข้อมูลให้ครบถ้วน"})
		return
	}

	// Check if username is already taken (excluding current user)
	var existingUser models.User
	err = config.DB.Collection("users").FindOne(context.TODO(), bson.M{
		"username": req.Username,
		"_id":      bson.M{"$ne": objID},
	}).Decode(&existingUser)
	if err == nil {
		c.JSON(400, gin.H{"error": "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว"})
		return
	}

	// Check if email is already taken (excluding current user)
	err = config.DB.Collection("users").FindOne(context.TODO(), bson.M{
		"email": req.Email,
		"_id":   bson.M{"$ne": objID},
	}).Decode(&existingUser)
	if err == nil {
		c.JSON(400, gin.H{"error": "อีเมลนี้ถูกใช้งานแล้ว"})
		return
	}

	// Prepare update data
	update := bson.M{
		"$set": bson.M{
			"name":     req.Name,
			"surname":  req.Surname,
			"username": req.Username,
			"email":    req.Email,
		},
	}

	// Handle password update if provided
	if req.NewPassword != "" {
		// Verify current password
		if req.CurrentPassword == "" {
			c.JSON(400, gin.H{"error": "กรุณากรอกรหัสผ่านปัจจุบัน"})
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(currentUser.Password), []byte(req.CurrentPassword)); err != nil {
			c.JSON(401, gin.H{"error": "รหัสผ่านปัจจุบันไม่ถูกต้อง"})
			return
		}

		// Hash new password
		hashedPwd, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(500, gin.H{"error": "เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่าน"})
			return
		}

		update["$set"].(bson.M)["password"] = string(hashedPwd)
	}

	// Update user
	result, err := config.DB.Collection("users").UpdateByID(context.TODO(), objID, update)
	if err != nil {
		c.JSON(500, gin.H{"error": "ไม่สามารถอัพเดทข้อมูลได้"})
		return
	}

	if result.ModifiedCount == 0 {
		c.JSON(400, gin.H{"error": "ไม่มีการเปลี่ยนแปลงข้อมูล"})
		return
	}

	// Get updated user data
	var updatedUser models.User
	err = config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&updatedUser)
	if err != nil {
		c.JSON(500, gin.H{"error": "ไม่สามารถดึงข้อมูลที่อัพเดทได้"})
		return
	}

	updatedUser.Password = "" // hide password
	c.JSON(200, gin.H{
		"message": "อัพเดทข้อมูลสำเร็จ",
		"user":    updatedUser,
	})
}

func UploadAvatar(c *gin.Context) {
	userID := c.MustGet("user_id").(string)
	objID, _ := primitive.ObjectIDFromHex(userID)

	file, fileHeader, err := c.Request.FormFile("avatar")
	if err != nil {
		c.JSON(400, gin.H{"error": "Failed to read file"})
		return
	}
	defer file.Close()

	buffer := bytes.NewBuffer(nil)
	if _, err := io.Copy(buffer, file); err != nil {
		c.JSON(500, gin.H{"error": "Failed to read image"})
		return
	}

	filename := fmt.Sprintf("avatars/%s_%s", userID, fileHeader.Filename)
	avatarURL, err := uploadToS3(buffer.Bytes(), filename, fileHeader)
	if err != nil {
		c.JSON(500, gin.H{"error": "Upload to S3 failed", "detail": err.Error()})
		return
	}

	// Update user's avatar URL
	_, err = config.DB.Collection("users").UpdateByID(context.TODO(), objID, bson.M{
		"$set": bson.M{"avatar_url": avatarURL},
	})
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update avatar"})
		return
	}

	// Get updated user data
	var user models.User
	err = config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get updated user data"})
		return
	}

	user.Password = "" // hide password
	c.JSON(200, gin.H{
		"message": "Avatar updated",
		"user":    user,
	})
}

func uploadToS3(fileData []byte, filename string, fileHeader *multipart.FileHeader) (string, error) {
	region := config.Env("AWS_REGION")
	bucket := config.Env("AWS_BUCKET_NAME")
	accessKey := config.Env("AWS_ACCESS_KEY_ID")
	secretKey := config.Env("AWS_SECRET_ACCESS_KEY")

	cfg, err := awsConfig.LoadDefaultConfig(context.TODO(),
		awsConfig.WithRegion(region),
		awsConfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		return "", err
	}

	client := s3.NewFromConfig(cfg)

	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:        aws.String(bucket),
		Key:           aws.String(filename),
		Body:          bytes.NewReader(fileData),
		ContentType:   aws.String(fileHeader.Header.Get("Content-Type")),
		ContentLength: aws.Int64(fileHeader.Size),
	})
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucket, region, filename)
	return url, nil
}

func DeleteAccount(c *gin.Context) {
	userID := c.MustGet("user_id").(string)
	objID, _ := primitive.ObjectIDFromHex(userID)

	_, err := config.DB.Collection("users").DeleteOne(context.TODO(), bson.M{"_id": objID})
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete account"})
		return
	}

	c.JSON(200, gin.H{"message": "Account deleted"})
}
