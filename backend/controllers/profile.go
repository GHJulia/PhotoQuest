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

	var user models.User
	err := config.DB.Collection("users").FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	user.Password = "" // hide password
	c.JSON(http.StatusOK, user)
}

func UpdateProfile(c *gin.Context) {
	userID := c.MustGet("user_id").(string)
	objID, _ := primitive.ObjectIDFromHex(userID)

	var updateData models.User
	if err := c.BindJSON(&updateData); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	hashedPwd, err := bcrypt.GenerateFromPassword([]byte(updateData.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to hash password"})
		return
	}

	update := bson.M{
		"$set": bson.M{
			"name":      updateData.Name,
			"surname":   updateData.Surname,
			"username":  updateData.Username,
			"email":     updateData.Email,
			"password":  string(hashedPwd),
		},
	}

	_, err = config.DB.Collection("users").UpdateByID(context.TODO(), objID, update)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(200, gin.H{"message": "Profile updated"})
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

	_, err = config.DB.Collection("users").UpdateByID(context.TODO(), objID, bson.M{
		"$set": bson.M{"avatar_url": avatarURL},
	})
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update avatar"})
		return
	}

	c.JSON(200, gin.H{"message": "Avatar updated", "url": avatarURL})
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