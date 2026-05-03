// Package pagination 提供统一的分页参数解析与响应结构。
// 直接从 sport-api/utils/pagination.go 提升，补全其他服务缺失的分页工具。
package pagination

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

const (
	DefaultPageSize = 20
	MaxPageSize     = 100
)

// Params 分页请求参数，由 Parse 从 gin.Context 解析得到。
type Params struct {
	Page     int
	PageSize int
	Offset   int
}

// Meta 分页元数据，用于响应体。
type Meta struct {
	Page       int `json:"page"`
	PageSize   int `json:"page_size"`
	TotalItems int `json:"total_items"`
	TotalPages int `json:"total_pages"`
}

// Result 通用分页响应结构，嵌入 httpresponse.Success 的 data 字段。
type Result struct {
	List       interface{} `json:"list"`
	Pagination Meta        `json:"pagination"`
}

// Parse 从请求的 query string 中解析 page 和 page_size 参数。
// page 默认 1，page_size 默认 DefaultPageSize，最大 MaxPageSize。
func Parse(c *gin.Context) Params {
	page, pageSize := 1, DefaultPageSize

	if v, err := strconv.Atoi(c.Query("page")); err == nil && v > 0 {
		page = v
	}
	if v, err := strconv.Atoi(c.Query("page_size")); err == nil && v > 0 {
		if v > MaxPageSize {
			v = MaxPageSize
		}
		pageSize = v
	}

	return Params{
		Page:     page,
		PageSize: pageSize,
		Offset:   (page - 1) * pageSize,
	}
}

// NewResult 根据列表数据和总数构造分页响应结构。
func NewResult(list interface{}, total int64, p Params) Result {
	totalPages := int((total + int64(p.PageSize) - 1) / int64(p.PageSize))
	if totalPages < 0 {
		totalPages = 0
	}
	return Result{
		List: list,
		Pagination: Meta{
			Page:       p.Page,
			PageSize:   p.PageSize,
			TotalItems: int(total),
			TotalPages: totalPages,
		},
	}
}
