package utils

import (
    "fmt"
    "gopkg.in/mail.v2"
    "math/rand"
    "os"
    "strconv"
)

func GenerateOTP() string {
    return strconv.Itoa(rand.Intn(900000) + 100000)
}

func SendEmail(to string, code string) error {
    m := mail.NewMessage()
    m.SetHeader("From", os.Getenv("EMAIL_USER"))
    m.SetHeader("To", to)
    m.SetHeader("Subject", "Your OTP Code")
    m.SetBody("text/plain", fmt.Sprintf("Your OTP code is: %s", code))

    port, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))
    d := mail.NewDialer(os.Getenv("SMTP_HOST"), port, os.Getenv("EMAIL_USER"), os.Getenv("EMAIL_PASS"))

    return d.DialAndSend(m)
}
