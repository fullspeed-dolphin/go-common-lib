// Package redisutil 提供 Redis 客户端初始化工具，以 sport-api 的完整版本为基准。
package redisutil

import (
	"context"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
)

// RedisConfig Redis 连接配置，各服务 Config 直接嵌入或引用。
type RedisConfig struct {
	Addr     string
	Password string
	DB       int
}

// Options Redis 初始化可选参数。
type Options struct {
	DialTimeout  time.Duration
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	PoolSize     int
	MinIdleConns int
}

func defaultOptions() Options {
	return Options{
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolSize:     10,
		MinIdleConns: 5,
	}
}

// InitRedis 初始化 Redis 客户端并验证连通性。
// opts 为空时使用合理默认值（PoolSize=10, 各超时已配置）。
func InitRedis(cfg RedisConfig, opts ...Options) (*redis.Client, error) {
	o := defaultOptions()
	if len(opts) > 0 {
		o = opts[0]
	}

	client := redis.NewClient(&redis.Options{
		Addr:         cfg.Addr,
		Password:     cfg.Password,
		DB:           cfg.DB,
		DialTimeout:  o.DialTimeout,
		ReadTimeout:  o.ReadTimeout,
		WriteTimeout: o.WriteTimeout,
		PoolSize:     o.PoolSize,
		MinIdleConns: o.MinIdleConns,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		client.Close()
		return nil, fmt.Errorf("redis ping: %w", err)
	}

	return client, nil
}
