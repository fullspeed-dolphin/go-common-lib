package httpresponse_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/fullspeed-dolphin/go-common-lib/httpresponse"
	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func newCtx(method, path string) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(method, path, nil)
	return c, w
}

func decode(t *testing.T, w *httptest.ResponseRecorder) httpresponse.APIResponse {
	t.Helper()
	var resp httpresponse.APIResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	return resp
}

func TestSuccess(t *testing.T) {
	c, w := newCtx("GET", "/")
	httpresponse.Success(c, map[string]string{"key": "value"})

	if w.Code != http.StatusOK {
		t.Errorf("status: got %d, want 200", w.Code)
	}
	resp := decode(t, w)
	if resp.Code != 200 || resp.Msg != "success" {
		t.Errorf("unexpected response: %+v", resp)
	}
}

func TestBadRequest(t *testing.T) {
	c, w := newCtx("POST", "/")
	httpresponse.BadRequest(c, "参数错误")

	if w.Code != http.StatusBadRequest {
		t.Errorf("status: got %d, want 400", w.Code)
	}
	resp := decode(t, w)
	if resp.Code != 400 || resp.Msg != "参数错误" {
		t.Errorf("unexpected response: %+v", resp)
	}
}

func TestUnauthorized(t *testing.T) {
	c, w := newCtx("GET", "/")
	httpresponse.Unauthorized(c, "未授权")

	if w.Code != http.StatusUnauthorized {
		t.Errorf("status: got %d, want 401", w.Code)
	}
}

func TestInternalError(t *testing.T) {
	c, w := newCtx("GET", "/")
	httpresponse.InternalError(c, "服务器错误")

	if w.Code != http.StatusInternalServerError {
		t.Errorf("status: got %d, want 500", w.Code)
	}
}

func TestSuccessPage(t *testing.T) {
	c, w := newCtx("GET", "/")
	httpresponse.SuccessPage(c, []string{"a", "b"}, 100, 2, 20)

	if w.Code != http.StatusOK {
		t.Errorf("status: got %d, want 200", w.Code)
	}
	var raw struct {
		Data httpresponse.PageData `json:"data"`
	}
	json.NewDecoder(w.Body).Decode(&raw)
	if raw.Data.Total != 100 || raw.Data.Page != 2 || raw.Data.PageSize != 20 {
		t.Errorf("page data: %+v", raw.Data)
	}
}
