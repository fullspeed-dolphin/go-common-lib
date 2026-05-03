// Package httpresponse 提供统一的 Gin HTTP 响应格式与 helper 函数。
// 所有服务的 JSON 响应统一为 {code, msg, data} 结构。
package httpresponse

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// APIResponse 统一响应结构体，所有接口均返回此格式。
type APIResponse struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data,omitempty"`
}

// PageData 分页列表响应数据结构。
type PageData struct {
	List     interface{} `json:"list"`
	Total    int64       `json:"total"`
	Page     int         `json:"page"`
	PageSize int         `json:"page_size"`
}

func write(c *gin.Context, httpStatus, code int, msg string, data interface{}) {
	c.JSON(httpStatus, APIResponse{Code: code, Msg: msg, Data: data})
}

// Success 返回 200 成功响应。
func Success(c *gin.Context, data interface{}) {
	write(c, http.StatusOK, 200, "success", data)
}

// Created 返回 201 创建成功响应。
func Created(c *gin.Context, data interface{}) {
	write(c, http.StatusCreated, 200, "success", data)
}

// SuccessPage 返回分页列表响应。
func SuccessPage(c *gin.Context, list interface{}, total int64, page, pageSize int) {
	Success(c, PageData{List: list, Total: total, Page: page, PageSize: pageSize})
}

// Error 返回自定义 HTTP 状态码的错误响应，code 字段与 httpStatus 相同。
func Error(c *gin.Context, httpStatus int, msg string) {
	write(c, httpStatus, httpStatus, msg, nil)
}

// BadRequest 返回 400 响应。
func BadRequest(c *gin.Context, msg string) {
	Error(c, http.StatusBadRequest, msg)
}

// Unauthorized 返回 401 响应。
func Unauthorized(c *gin.Context, msg string) {
	Error(c, http.StatusUnauthorized, msg)
}

// Forbidden 返回 403 响应。
func Forbidden(c *gin.Context, msg string) {
	Error(c, http.StatusForbidden, msg)
}

// NotFound 返回 404 响应。
func NotFound(c *gin.Context, msg string) {
	Error(c, http.StatusNotFound, msg)
}

// InternalError 返回 500 响应。
func InternalError(c *gin.Context, msg string) {
	Error(c, http.StatusInternalServerError, msg)
}
