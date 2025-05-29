package config

import "os"

// Env reads a value from environment variables
func Env(key string) string {
	return os.Getenv(key)
}