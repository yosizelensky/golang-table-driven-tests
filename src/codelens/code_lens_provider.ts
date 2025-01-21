import * as vscode from 'vscode';
import { findParentTestFunction } from '../utils/parent_test_function_finder';

export class GoTestCodeLensProvider implements vscode.CodeLensProvider {
  
  private structuredRegex = /(?<=(\{|,)\s*\{)\s*name\s*:\s*"([^"]+)"/g;
  private inlineRegex = /(?<=(\{|,)\s*)\{"([^"]+)",\s*[^}]+\}/g;

  public async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {

    console.log('[INFO] Checking Provide code lenses for file:', document.fileName);

    if (!document.fileName.endsWith('_test.go')) {
      return [];
    }

    const text = document.getText();
    const codeLenses: vscode.CodeLens[] = [];
    let match;

    // Process structured test cases
    while ((match = this.structuredRegex.exec(text)) !== null) {
      console.log(`[INFO] Found a structured test case match: ${match}`);
      const parentTestFunction = await findParentTestFunction(document.fileName, match[0]);
      if (!parentTestFunction) {
        continue;
      }

      const startPosition = document.positionAt(match.index);
      const range = new vscode.Range(startPosition, startPosition);

      codeLenses.push(
        new vscode.CodeLens(range, {
          title: `run test`,
          command: 'go-test-decorator.runTest',
          arguments: [match[2]],
        }),
        new vscode.CodeLens(range, {
          title: `debug test`,
          command: 'go-test-decorator.debugTest',
          arguments: [match[2]],
        })
      );
    }

    // Process inline test cases
    while ((match = this.inlineRegex.exec(text)) !== null) {
      console.log(`[INFO] Found an inline test case match: ${match}`);
      const parentTestFunction = await findParentTestFunction(document.fileName, match[0]);
      if (!parentTestFunction) {
        continue;
      }

      const startPosition = document.positionAt(match.index);
      const range = new vscode.Range(startPosition, startPosition);

      codeLenses.push(
        new vscode.CodeLens(range, {
          title: `run test`,
          command: 'go-test-decorator.runTest',
          arguments: [match[2]],
        }),
        new vscode.CodeLens(range, {
          title: `debug test`,
          command: 'go-test-decorator.debugTest',
          arguments: [match[2]],
        })
      );
    }

    return codeLenses;
  }
}
