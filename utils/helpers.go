package utils

import (
	"fmt"
	"math/rand"
	"os"
	"strconv"

	mail "gopkg.in/mail.v2"
)

// GenerateOTP returns a 6-digit OTP
func GenerateOTP() string {
	return strconv.Itoa(rand.Intn(900000) + 100000)
}

// SendEmail sends a basic message (for OTP or general)
func SendEmail(to string, subject string, body string) error {
	m := mail.NewMessage()
	m.SetHeader("From", os.Getenv("EMAIL_USER"))
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", body)

	port, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))
	d := mail.NewDialer(os.Getenv("SMTP_HOST"), port, os.Getenv("EMAIL_USER"), os.Getenv("EMAIL_PASS"))

	return d.DialAndSend(m)
}

// SendOTP wraps SendEmail for OTP use only
func SendOTP(to string, otp string) error {
	subject := "Your OTP Code"
	body := fmt.Sprintf("Your OTP code is: %s", otp)
	return SendEmail(to, subject, body)
}
