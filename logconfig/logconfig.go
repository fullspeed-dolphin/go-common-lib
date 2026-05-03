// Package logconfig 提供统一的日志配置结构体，供各服务 Config 嵌入使用。
// 通过 ToLoggerConfig 方法可直接转换为 go-logger 所需的 Config，
// 消除各服务重复定义 LogConfig 并手动映射字段的样板代码。
package logconfig

import (
	logger "github.com/fullspeed-dolphin/go-logger"
)

// LogConfig 日志配置，与 go-logger.Config 字段保持对齐。
// 各服务 Config 直接嵌入此结构体，从环境变量加载时配合 envconfig 包使用。
type LogConfig struct {
	Level           string `yaml:"level"`            // debug | info | warn | error，默认 info
	File            string `yaml:"file"`             // 日志文件路径；空则仅 stdout
	MaxSizeMB       int    `yaml:"max_size_mb"`      // 单文件最大 MB
	MaxBackups      int    `yaml:"max_backups"`      // 保留旧文件数
	MaxAgeDays      int    `yaml:"max_age_days"`     // 旧文件最大保留天数
	DisableCompress bool   `yaml:"disable_compress"` // true 则关闭压缩
	DisableConsole  bool   `yaml:"disable_console"`  // 落盘时是否关闭 stdout
}

// ToLoggerConfig 将 LogConfig 转换为 go-logger 的 Config。
// appName 会作为固定字段 app 写入每条日志。
func (c LogConfig) ToLoggerConfig(appName string) *logger.Config {
	return &logger.Config{
		Level:           c.Level,
		AppName:         appName,
		OutputPath:      c.File,
		MaxSizeMB:       c.MaxSizeMB,
		MaxBackups:      c.MaxBackups,
		MaxAgeDays:      c.MaxAgeDays,
		DisableCompress: c.DisableCompress,
		DisableConsole:  c.DisableConsole,
	}
}
