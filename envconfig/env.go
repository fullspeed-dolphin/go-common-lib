// Package envconfig 提供统一的环境变量读取工具函数。
// 替代各服务自己实现的 getEnv / getEnvInt / getEnvBool，消除重复代码。
package envconfig

import (
	"os"
	"strconv"
)

// GetEnv 读取字符串类型环境变量，未设置或为空时返回 defaultValue。
func GetEnv(key, defaultValue string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultValue
}

// GetEnvInt 读取整型环境变量，未设置或解析失败时返回 defaultValue。
func GetEnvInt(key string, defaultValue int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return defaultValue
}

// GetEnvBool 读取布尔型环境变量，仅 "true" 视为 true，其余视为 false。
// 未设置时返回 defaultValue。
func GetEnvBool(key string, defaultValue bool) bool {
	v := os.Getenv(key)
	if v == "" {
		return defaultValue
	}
	return v == "true"
}
