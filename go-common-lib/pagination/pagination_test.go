package pagination_test

import (
	"net/http/httptest"
	"testing"

	"github.com/fullspeed-dolphin/ccrun/pagination"
	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func newCtx(query string) *gin.Context {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/?"+query, nil)
	return c
}

func TestParse_Defaults(t *testing.T) {
	p := pagination.Parse(newCtx(""))
	if p.Page != 1 {
		t.Errorf("Page: got %d, want 1", p.Page)
	}
	if p.PageSize != pagination.DefaultPageSize {
		t.Errorf("PageSize: got %d, want %d", p.PageSize, pagination.DefaultPageSize)
	}
	if p.Offset != 0 {
		t.Errorf("Offset: got %d, want 0", p.Offset)
	}
}

func TestParse_CustomValues(t *testing.T) {
	p := pagination.Parse(newCtx("page=3&page_size=10"))
	if p.Page != 3 {
		t.Errorf("Page: got %d, want 3", p.Page)
	}
	if p.PageSize != 10 {
		t.Errorf("PageSize: got %d, want 10", p.PageSize)
	}
	if p.Offset != 20 {
		t.Errorf("Offset: got %d, want 20", p.Offset)
	}
}

func TestParse_MaxPageSize(t *testing.T) {
	p := pagination.Parse(newCtx("page_size=9999"))
	if p.PageSize != pagination.MaxPageSize {
		t.Errorf("PageSize should be capped at %d, got %d", pagination.MaxPageSize, p.PageSize)
	}
}

func TestParse_InvalidValues(t *testing.T) {
	p := pagination.Parse(newCtx("page=abc&page_size=-1"))
	if p.Page != 1 {
		t.Errorf("invalid page: got %d, want 1", p.Page)
	}
	if p.PageSize != pagination.DefaultPageSize {
		t.Errorf("invalid page_size: got %d, want %d", p.PageSize, pagination.DefaultPageSize)
	}
}

func TestNewResult(t *testing.T) {
	p := pagination.Params{Page: 2, PageSize: 10, Offset: 10}
	result := pagination.NewResult([]string{"a"}, 25, p)

	if result.Pagination.TotalItems != 25 {
		t.Errorf("TotalItems: got %d, want 25", result.Pagination.TotalItems)
	}
	if result.Pagination.TotalPages != 3 {
		t.Errorf("TotalPages: got %d, want 3", result.Pagination.TotalPages)
	}
	if result.Pagination.Page != 2 {
		t.Errorf("Page: got %d, want 2", result.Pagination.Page)
	}
}
