// Test utilities to simulate extension behavior

function findTestCases(text) {
  const tests = [];

  // Support both lowercase 'name' and uppercase 'Name' fields
  const structuredRegex = /[Nn]ame\s*:\s*"([^"]+)"/g;
  // Match inline pattern {"name", ...}
  const inlineRegex = /\{"([^"]+)",\s*[^}]+\}/g;

  let match;

  // Find structured test cases
  while ((match = structuredRegex.exec(text)) !== null) {
    tests.push(match[1]);
  }

  // Find inline test cases
  while ((match = inlineRegex.exec(text)) !== null) {
    tests.push(match[1]);
  }

  // Also check for test cases in variables
  const varRegex = /(?:var\s+)?(\w+)\s*=\s*\[]/g;
  while ((match = varRegex.exec(text)) !== null) {
    const varStart = match.index;
    // Look ahead with 15MB limit
    const searchEnd = Math.min(varStart + 15728640, text.length);
    const varSection = text.substring(varStart, searchEnd);

    // Find test names in this section
    const varTests = [];
    const nameRegex = /[Nn]ame\s*:\s*"([^"]+)"/g;
    let nameMatch;
    while ((nameMatch = nameRegex.exec(varSection)) !== null) {
      if (!tests.includes(nameMatch[1])) {
        tests.push(nameMatch[1]);
      }
    }
  }

  return tests;
}

function escapeTestNameForRegex(testName) {
  return testName
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, '_');
}

function sanitizeTestNameForPath(testName) {
  return testName.replace(/\s+/g, '_');
}

module.exports = {
  findTestCases,
  escapeTestNameForRegex,
  sanitizeTestNameForPath
};