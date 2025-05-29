package utils

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	//s3types 
	// "github.com/aws/aws-sdk-go-v2/service/s3/types"
)

func UploadToS3(file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
	region := os.Getenv("AWS_REGION")
	bucket := os.Getenv("AWS_BUCKET_NAME")
	accessKey := os.Getenv("AWS_ACCESS_KEY_ID")
	secretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		return "", fmt.Errorf("failed to load AWS config: %v", err)
	}

	client := s3.NewFromConfig(cfg)

	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), fileHeader.Filename)
	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(filename),
		Body:        file,
		ContentType: aws.String(fileHeader.Header.Get("Content-Type")),
		// ACL:         s3types.ObjectCannedACLPublicRead,
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload to S3: %v", err)
	}

	// Return public S3 URL
	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucket, region, filename)
	return url, nil
}