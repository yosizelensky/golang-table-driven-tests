import * as vscode from 'vscode';
import { findParentTestFunction } from '../utils/parent_test_function_finder';

export class GoTestCodeLensProvider implements vscode.CodeLensProvider {
  
  // TODO check if it's better to use 2 regex
	private regex = /(?:name\s*:\s*"([^"]+)"|{"([^"]+)")/g;

	public async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {

		console.log('[INFO] Checking Provide code lenses for file:', document.fileName);

		if (!document.fileName.endsWith('_test.go')) {
			return [];
		}

		const text = document.getText();
		const codeLenses: vscode.CodeLens[] = [];
		let match;

		while ((match = this.regex.exec(text)) !== null) {

			console.log(`[INFO] Found a regex match: ${match}`);

			const parentTestFunction = await findParentTestFunction(document.fileName, match[0]);
			if (!parentTestFunction) {
				continue;
			}

			const startPosition = document.positionAt(match.index);
			const range = new vscode.Range(startPosition, startPosition);

      // TODO check if this is the best way to handle the case when the test name is in the second group
      if (match[1] === undefined) {
        match[1] = match[2];
      }

			codeLenses.push(
				new vscode.CodeLens(range, {
					title: `run test`,
					command: 'go-test-decorator.runTest',
					arguments: [match[1]],
				}),
				new vscode.CodeLens(range, {
					title: `debug test`,
					command: 'go-test-decorator.debugTest',
					arguments: [match[1]],
				})
			);
		}

		return codeLenses;
	}
}