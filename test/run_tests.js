#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Test utilities
const testUtils = require('./test_utils');

console.log('🧪 Go Table-Driven Tests Extension Test Suite\n');

// Test files to validate
const testFiles = [
  'test_files/simple_test.go',
  'test_files/variable_test.go',
  'test_files/suite_test.go',
  'test_files/large_test.go',
  'test_files/special_chars_test.go'
];

const expectedTests = {
  'simple_test.go': {
    tests: ['add one', 'add two', 'add three', 'uppercase test 1', 'uppercase test 2',
            'inline test 1', 'inline test 2', 'inline test 3'],
    description: 'Standard test cases with name and Name fields'
  },
  'variable_test.go': {
    tests: ['variable test 1', 'variable test 2', 'another test 1', 'another test 2'],
    description: 'Test cases in variables declared outside functions'
  },
  'suite_test.go': {
    tests: ['suite test 1', 'suite test 2'],
    description: 'Test suite methods'
  },
  'large_test.go': {
    tests: ['large test 1', 'large test 1000', 'large test final'],
    description: 'Large test array to verify 15MB limit'
  },
  'special_chars_test.go': {
    tests: ['test with spaces in name', 'test/with/slashes', 'test+with+plus',
            'test.with.dots', 'test[with]brackets'],
    description: 'Special characters that need escaping'
  }
};

let totalTests = 0;
let passedTests = 0;

// Test each file
for (const testFile of testFiles) {
  const fileName = path.basename(testFile);
  const fullPath = path.join(__dirname, testFile);

  console.log(`\n📁 Testing ${fileName}`);
  console.log(`   ${expectedTests[fileName].description}`);

  if (!fs.existsSync(fullPath)) {
    console.log(`   ❌ File not found: ${fullPath}`);
    continue;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const results = testUtils.findTestCases(content);

  for (const expectedTest of expectedTests[fileName].tests) {
    totalTests++;
    if (results.includes(expectedTest)) {
      console.log(`   ✅ Found: "${expectedTest}"`);
      passedTests++;
    } else {
      console.log(`   ❌ Missing: "${expectedTest}"`);
    }
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log(`📊 Test Results: ${passedTests}/${totalTests} passed`);

if (passedTests === totalTests) {
  console.log('✨ All tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}