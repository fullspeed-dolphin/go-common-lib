package envconfig_test

import (
	"os"
	"testing"

	"github.com/fullspeed-dolphin/go-common-lib/envconfig"
)

func TestGetEnv(t *testing.T) {
	t.Run("returns value when set", func(t *testing.T) {
		os.Setenv("TEST_KEY", "hello")
		defer os.Unsetenv("TEST_KEY")
		if got := envconfig.GetEnv("TEST_KEY", "default"); got != "hello" {
			t.Errorf("got %q, want %q", got, "hello")
		}
	})

	t.Run("returns default when unset", func(t *testing.T) {
		os.Unsetenv("TEST_KEY")
		if got := envconfig.GetEnv("TEST_KEY", "default"); got != "default" {
			t.Errorf("got %q, want %q", got, "default")
		}
	})

	t.Run("returns default when empty string", func(t *testing.T) {
		os.Setenv("TEST_KEY", "")
		defer os.Unsetenv("TEST_KEY")
		if got := envconfig.GetEnv("TEST_KEY", "fallback"); got != "fallback" {
			t.Errorf("got %q, want %q", got, "fallback")
		}
	})
}

func TestGetEnvInt(t *testing.T) {
	t.Run("returns parsed int", func(t *testing.T) {
		os.Setenv("TEST_INT", "42")
		defer os.Unsetenv("TEST_INT")
		if got := envconfig.GetEnvInt("TEST_INT", 0); got != 42 {
			t.Errorf("got %d, want 42", got)
		}
	})

	t.Run("returns default when unset", func(t *testing.T) {
		os.Unsetenv("TEST_INT")
		if got := envconfig.GetEnvInt("TEST_INT", 99); got != 99 {
			t.Errorf("got %d, want 99", got)
		}
	})

	t.Run("returns default when not a number", func(t *testing.T) {
		os.Setenv("TEST_INT", "abc")
		defer os.Unsetenv("TEST_INT")
		if got := envconfig.GetEnvInt("TEST_INT", 7); got != 7 {
			t.Errorf("got %d, want 7", got)
		}
	})
}

func TestGetEnvBool(t *testing.T) {
	cases := []struct {
		val  string
		want bool
	}{
		{"true", true},
		{"false", false},
		{"1", false},
		{"yes", false},
		{"TRUE", false},
	}
	for _, c := range cases {
		os.Setenv("TEST_BOOL", c.val)
		if got := envconfig.GetEnvBool("TEST_BOOL", false); got != c.want {
			t.Errorf("val=%q: got %v, want %v", c.val, got, c.want)
		}
		os.Unsetenv("TEST_BOOL")
	}

	t.Run("returns default when unset", func(t *testing.T) {
		os.Unsetenv("TEST_BOOL")
		if got := envconfig.GetEnvBool("TEST_BOOL", true); !got {
			t.Error("expected default true")
		}
	})
}
