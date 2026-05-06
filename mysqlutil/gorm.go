// Package mysqlutil 提供 MySQL 数据库连接初始化工具，支持 GORM 和 database/sql 两种用法。
package mysqlutil

import (
	"fmt"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DBConfig MySQL 连接配置，各服务 Config 直接嵌入或引用。
type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	// DSNExtra 附加 DSN 参数（以 & 开头），用于服务特定需求。
	// 例如："&collation=utf8mb4_unicode_ci&interpolateParams=true"
	DSNExtra string
}

// GORMOptions GORM 初始化可选参数。
type GORMOptions struct {
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
	LogLevel        logger.LogLevel
}

func defaultGORMOptions() GORMOptions {
	return GORMOptions{
		MaxOpenConns:    25,
		MaxIdleConns:    5,
		ConnMaxLifetime: 5 * time.Minute,
		LogLevel:        logger.Silent,
	}
}

// InitGORM 初始化 GORM 连接。opts 为空时使用合理默认值（MaxOpen=25, MaxIdle=5, Lifetime=5min）。
func InitGORM(cfg DBConfig, opts ...GORMOptions) (*gorm.DB, error) {
	o := defaultGORMOptions()
	if len(opts) > 0 {
		o = opts[0]
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=true&loc=Local%s",
		cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.Name, cfg.DSNExtra)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(o.LogLevel),
	})
	if err != nil {
		return nil, fmt.Errorf("gorm open: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("get sql.DB: %w", err)
	}
	sqlDB.SetMaxOpenConns(o.MaxOpenConns)
	sqlDB.SetMaxIdleConns(o.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(o.ConnMaxLifetime)

	return db, nil
}
