package test

import (
	"testing"
	"github.com/stretchr/testify/suite"
)

type MySuite struct {
	suite.Suite
}

func TestMySuite(t *testing.T) {
	suite.Run(t, new(MySuite))
}

func (s *MySuite) TestSomething() {
	tests := []struct {
		name string
		val  int
	}{
		{
			name: "suite test 1",
			val:  1,
		},
		{
			name: "suite test 2",
			val:  2,
		},
	}

	for _, tt := range tests {
		s.Run(tt.name, func() {
			// test logic
		})
	}
}