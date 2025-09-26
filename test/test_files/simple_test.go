package test

import (
	"testing"
)

// Test standard lowercase name field
func TestSimple(t *testing.T) {
	tests := []struct {
		name  string
		input int
		want  int
	}{
		{"add one", 1, 2},
		{"add two", 2, 3},
		{"add three", 3, 4},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.input + 1
			if got != tt.want {
				t.Errorf("got = %v, want = %v", got, tt.want)
			}
		})
	}
}

// Test uppercase Name field
func TestUppercaseName(t *testing.T) {
	tests := []struct {
		Name string
		Want int
	}{
		{
			Name: "uppercase test 1",
			Want: 1,
		},
		{
			Name: "uppercase test 2",
			Want: 2,
		},
	}

	for _, tt := range tests {
		t.Run(tt.Name, func(t *testing.T) {
			// test logic
		})
	}
}

// Test inline test cases
func TestInline(t *testing.T) {
	tests := []struct {
		name string
		val  int
	}{
		{"inline test 1", 10},
		{"inline test 2", 20},
		{"inline test 3", 30},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// test logic
		})
	}
}