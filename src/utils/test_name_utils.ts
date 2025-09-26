// Utility functions for handling test names

export function escapeTestNameForRegex(testName: string): string {
    // Escape special regex characters in the test name
    // Go test uses the test name as a regex pattern, so we need to escape special chars
    return testName
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')  // Escape regex special chars
        .replace(/\s+/g, '_');  // Replace spaces with underscores (Go test convention)
}

export function sanitizeTestNameForPath(testName: string): string {
    // Replace spaces with underscores for use in test paths
    // This is what Go test expects in the test path
    return testName.replace(/\s+/g, '_');
}