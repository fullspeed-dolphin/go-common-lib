package logconfig_test

import (
	"testing"

	"github.com/fullspeed-dolphin/ccrun/logconfig"
)

func TestToLoggerConfig(t *testing.T) {
	cfg := logconfig.LogConfig{
		Level:           "debug",
		File:            "/var/log/app.log",
		MaxSizeMB:       100,
		MaxBackups:      7,
		MaxAgeDays:      30,
		DisableCompress: true,
		DisableConsole:  false,
	}

	got := cfg.ToLoggerConfig("my-service")

	if got.Level != "debug" {
		t.Errorf("Level: got %q, want %q", got.Level, "debug")
	}
	if got.AppName != "my-service" {
		t.Errorf("AppName: got %q, want %q", got.AppName, "my-service")
	}
	if got.OutputPath != "/var/log/app.log" {
		t.Errorf("OutputPath: got %q, want %q", got.OutputPath, "/var/log/app.log")
	}
	if got.MaxSizeMB != 100 {
		t.Errorf("MaxSizeMB: got %d, want 100", got.MaxSizeMB)
	}
	if got.MaxBackups != 7 {
		t.Errorf("MaxBackups: got %d, want 7", got.MaxBackups)
	}
	if got.MaxAgeDays != 30 {
		t.Errorf("MaxAgeDays: got %d, want 30", got.MaxAgeDays)
	}
	if !got.DisableCompress {
		t.Error("DisableCompress: got false, want true")
	}
	if got.DisableConsole {
		t.Error("DisableConsole: got true, want false")
	}
}

func TestToLoggerConfig_ZeroValues(t *testing.T) {
	cfg := logconfig.LogConfig{}
	got := cfg.ToLoggerConfig("svc")

	if got.AppName != "svc" {
		t.Errorf("AppName: got %q, want %q", got.AppName, "svc")
	}
	if got.Level != "" {
		t.Errorf("Level should be empty, got %q", got.Level)
	}
	if got.OutputPath != "" {
		t.Errorf("OutputPath should be empty, got %q", got.OutputPath)
	}
}
