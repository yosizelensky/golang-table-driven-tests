# Go Table Driven Tests CodeLens Provider

A Visual Studio Code extension that enhances the workflow of working with Go test files by injecting **CodeLens** above test case declarations. These CodeLens actions allow you to easily run or debug individual test cases with a single click.

## 📖 Overview

The `Go Test CodeLens Provider` extension simplifies the process of running and debugging Go test cases directly from the editor. It works seamlessly with both structured and inline test case declarations in Go, identifying test cases by their `name` field or inline definitions.

Given the following single-line test structure:

```go
func TestSingleLineTable(t *testing.T) {
	tests := []struct {
		name  string
		input int
		want  int
	}{
		{"test case 1", 1, 2},
		{"test case 2", 2, 4},
		{"test case 3", 3, 6},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
        // test logic here
		})
	}
}
```

Or this multi-line test structure:

```go
func TestMultilineTable(t *testing.T) {
	tests := []struct {
		name  string
		input int
		want  int
	}{
		{
			name:  "test case 1",
			input: 4,
			want:  8,
		},
		{
			name:  "test case 2",
			input: 5,
			want:  10,
		},
		{
			name:  "test case 3",
			input: 6,
			want:  12,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fmt.Println("TestMultilineTable: ", tt.name)
			got := tt.input * 2
			if got != tt.want {
				t.Errorf("got = %v, want = %v", got, tt.want)
			}
		})
	}
}
```

The extension will display Run Test and Debug Test options above each test case declaration.

## 🚀 Features

### CodeLens for Structured Test Cases: 
Detects and highlights test cases with a name field inside struct declarations.

### CodeLens for Inline Test Cases: 
Recognizes inline test case definitions within test arrays or slices.

### One-Click Testing: 
Run or debug individual test cases directly from the editor.

### Parent Test Function Detection: 
Associates test cases with their parent test function to ensure proper execution.

## 🔧 Problem It Solves

Manually identifying and executing specific test cases in large test suites can be time-consuming. This extension automates this process by injecting actionable CodeLens above test case declarations, allowing developers to:

* Quickly identify test cases.
* Run or debug individual tests without modifying code.
* Improve workflow efficiency and reduce context switching.

## 🖥️ Compatibility
Supported VS Code Versions: >=1.93.0.
Supported Go Versions: Standard Go testing patterns are assumed.

## 📚 Usage
Open a _test.go file in your Go project.
Hover over test case declarations to see the Run Test and Debug Test options.
Click the desired option to run or debug the specific test case.

## 💡 Notes
This extension uses regular expressions to identify test case declarations. Ensure your test cases follow standard Go testing patterns.
For structured test cases, ensure the name field is present at the beginning of the test declaration and uniquely identifies each test.

## 🔄 Fork Improvements

This fork includes the following enhancements:

* **Support for uppercase `Name` fields** - Works with both `name` and `Name` field conventions
* **Large file support** - Handles test files with thousands of test cases (up to 15MB)
* **Test suite support** - Properly detects and runs tests in testify/suite style test methods
* **Variable test definitions** - Supports test arrays defined as package-level variables outside functions
* **Improved debugging** - Uses absolute paths and proper regex anchors for reliable debugging
* **Special character handling** - Correctly escapes test names with special regex characters

## 🛠️ Contributing
Contributions are welcome! Feel free to fork the repository, submit issues, or create pull requests.

## 📜 License
This project is licensed under the MIT License.