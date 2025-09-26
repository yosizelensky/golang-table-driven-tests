package test

import "testing"

// Test with a very large array to verify the 15MB limit works
var largeTests = []struct {
	Name string
}{
	{Name: "large test 1"},
	{Name: "large test 2"},
	{Name: "large test 3"},
	{Name: "large test 4"},
	{Name: "large test 5"},
	// ... imagine this continues for thousands of lines
	{Name: "large test 1000"},
	{Name: "large test 1001"},
	{Name: "large test 1002"},
	// This test is far into the array
	{Name: "large test final"},
}

func TestLarge(t *testing.T) {
	for _, tt := range largeTests {
		t.Run(tt.Name, func(t *testing.T) {
			// test logic
		})
	}
}