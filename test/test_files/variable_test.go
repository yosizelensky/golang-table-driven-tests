package test

import (
	"testing"
)

// Test with variable declared outside function
var testCases = []struct {
	name string
	val  int
}{
	{
		name: "variable test 1",
		val:  100,
	},
	{
		name: "variable test 2",
		val:  200,
	},
}

func TestWithVariable(t *testing.T) {
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// test logic
		})
	}
}

// Test with variable declaration without var keyword
var anotherTests = []struct {
	Name string
}{
	{Name: "another test 1"},
	{Name: "another test 2"},
}

func TestAnotherVariable(t *testing.T) {
	for _, test := range anotherTests {
		t.Run(test.Name, func(t *testing.T) {
			// test logic
		})
	}
}