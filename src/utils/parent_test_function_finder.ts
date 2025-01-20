import * as vscode from 'vscode';

export async function findParentTestFunction(testFile: string, testName: string): Promise<string | null> {

	console.log(`[INFO] Finding parent test function for: ${testName} in file: ${testFile}`);

	const document = await vscode.workspace.openTextDocument(testFile);
	const text = document.getText();

	const testFuncRegex = new RegExp(`func (Test\\w+)\\(t \\*testing\\.T\\)`, 'g');
	let match;
	let parentTestFunction: string | null = null;

	while ((match = testFuncRegex.exec(text)) !== null) {
		console.log(`[INFO] Found test function: ${match[0]}`);
		const funcName = match[1];
		console.log(`[INFO] Test function name: ${funcName}`);

		const funcStart = document.offsetAt(document.positionAt(match.index));
		console.log(`[INFO] Test function start: ${funcStart}`);

		let braceCount = 0;
		let funcEnd = funcStart;
		for (let i = funcStart; i < text.length; i++) {
			if (text[i] === '{') {
				braceCount++;
			} else if (text[i] === '}') {
				braceCount--;
				if (braceCount === 0) {
					funcEnd = i + 1;
					break;
				}
			}
		}
		console.log(`[INFO] Test function end: ${funcEnd}`);

		const funcBody = text.substring(funcStart, funcEnd);

		if (funcBody.includes(testName)) {
			console.log(`[INFO] Test function ${funcName} contains ${testName}`);
			parentTestFunction = funcName;
			break;
		}
	}

	console.log(`[INFO] Parent test function for ${testName}: ${parentTestFunction}`);

	return parentTestFunction;
}