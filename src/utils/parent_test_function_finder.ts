import * as vscode from 'vscode';
import * as path from 'path';

export async function findParentTestFunction(testFile: string, testName: string): Promise<string | null> {

	const document = await vscode.workspace.openTextDocument(testFile);
	const text = document.getText();

	// Check if the test name is in a variable declaration
	const varRegex = /(?:var\s+)?(\w+)\s*=\s*\[]/g;
	let variableName: string | null = null;
	let match;

	while ((match = varRegex.exec(text)) !== null) {
		const varName = match[1];
		const varStart = match.index;

		// Look ahead for the test name within a large limit (15MB)
		const searchEnd = Math.min(varStart + 15728640, text.length);
		const varSection = text.substring(varStart, searchEnd);

		if (varSection.includes(`"${testName}"`)) {
			variableName = varName;
			break;
		}
	}

	// First, try to find the parent test function in the current file
	let parentTestFunction = await findTestFunctionInFile(testFile, text, testName, variableName);

	// If we found a variable but no test function in the current file,
	// look for the test function in other files in the same package
	if (variableName && !parentTestFunction) {
		const testDir = path.dirname(testFile);
		const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(testDir));

		for (const [fileName, fileType] of files) {
			// Only check other _test.go files
			if (fileName.endsWith('_test.go') && fileName !== path.basename(testFile) && fileType === vscode.FileType.File) {
				const otherFilePath = path.join(testDir, fileName);

				try {
					const otherDoc = await vscode.workspace.openTextDocument(otherFilePath);
					const otherText = otherDoc.getText();

					// Check if this file references our variable
					if (otherText.includes(variableName)) {
						parentTestFunction = await findTestFunctionInFile(otherFilePath, otherText, testName, variableName);
						if (parentTestFunction) {
							break;
						}
					}
				} catch (e) {
					// Ignore read errors
				}
			}
		}
	}

	return parentTestFunction;
}

async function findTestFunctionInFile(
	filePath: string,
	text: string,
	testName: string,
	variableName: string | null
): Promise<string | null> {

	// Match both regular test functions and suite test methods
	const testFuncRegex = new RegExp(`func (?:\\(\\s*\\w+\\s+\\*?(\\w+)\\s*\\) )?(Test\\w+)\\([^)]*\\)`, 'g');
	let match;

	while ((match = testFuncRegex.exec(text)) !== null) {
		const suiteType = match[1];  // Will be the suite type if it's a suite method
		const funcName = match[2];   // The test function name
		const funcStart = match.index;

		// Find the function body
		let braceStart = text.indexOf('{', funcStart);
		if (braceStart === -1) {
			continue;
		}

		let braceCount = 1;
		let funcEnd = braceStart + 1;

		while (funcEnd < text.length && braceCount > 0) {
			if (text[funcEnd] === '{') {
				braceCount++;
			} else if (text[funcEnd] === '}') {
				braceCount--;
			}
			funcEnd++;
		}

		const funcBody = text.substring(funcStart, funcEnd);

		// Check if the function contains the test name directly or references the variable
		if (funcBody.includes(`"${testName}"`)) {
			// If this is a suite method, we need to find the test that runs the suite
			if (suiteType) {
				const suiteFuncName = findSuiteRunnerFunction(text, suiteType);
				if (suiteFuncName) {
					return `${suiteFuncName}/${funcName}`;
				}
			}
			return funcName;
		} else if (variableName && funcBody.includes(variableName)) {
			// If this is a suite method, we need to find the test that runs the suite
			if (suiteType) {
				const suiteFuncName = findSuiteRunnerFunction(text, suiteType);
				if (suiteFuncName) {
					return `${suiteFuncName}/${funcName}`;
				}
			}
			return funcName;
		}
	}

	return null;
}

function findSuiteRunnerFunction(text: string, suiteType: string): string | null {
	// Look for a function that runs this suite
	const runnerRegex = new RegExp(`func (Test\\w+)\\([^)]*\\)`, 'g');
	let match;

	while ((match = runnerRegex.exec(text)) !== null) {
		const funcName = match[1];
		const funcStart = match.index;

		// Find the function body
		let braceStart = text.indexOf('{', funcStart);
		if (braceStart === -1) {
			continue;
		}

		let braceCount = 1;
		let funcEnd = braceStart + 1;

		while (funcEnd < text.length && braceCount > 0) {
			if (text[funcEnd] === '{') {
				braceCount++;
			} else if (text[funcEnd] === '}') {
				braceCount--;
			}
			funcEnd++;
		}

		const funcBody = text.substring(funcStart, funcEnd);

		// Check if this function runs our suite
		if (funcBody.includes(suiteType) && (funcBody.includes('suite.Run') || funcBody.includes('testutils.Run'))) {
			return funcName;
		}
	}

	return null;
}