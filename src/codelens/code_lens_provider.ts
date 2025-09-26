import * as vscode from 'vscode';
import { findParentTestFunction } from '../utils/parent_test_function_finder';

export class GoTestCodeLensProvider implements vscode.CodeLensProvider {

  // Support both lowercase 'name' and uppercase 'Name' fields
  private structuredRegex = /[Nn]ame\s*:\s*"([^"]+)"/g;
  // Match inline pattern {"name", ...}
  private inlineRegex = /\{"([^"]+)",\s*[^}]+\}/g;

  public async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {

    if (!document.fileName.endsWith('_test.go')) {
      return [];
    }

    const text = document.getText();
    const codeLenses: vscode.CodeLens[] = [];
    let match;

    // Reset regex lastIndex to ensure it starts from beginning
    this.structuredRegex.lastIndex = 0;
    this.inlineRegex.lastIndex = 0;

    // Process structured test cases
    while ((match = this.structuredRegex.exec(text)) !== null) {
      const testName = match[1];
      const parentTestFunction = await findParentTestFunction(document.fileName, testName);
      if (!parentTestFunction) {
        continue;
      }

      const startPosition = document.positionAt(match.index);
      const range = new vscode.Range(startPosition, startPosition);

      codeLenses.push(
        new vscode.CodeLens(range, {
          title: `run test`,
          command: 'go-test-decorator.runTest',
          arguments: [testName],
        }),
        new vscode.CodeLens(range, {
          title: `debug test`,
          command: 'go-test-decorator.debugTest',
          arguments: [testName],
        })
      );
    }

    // Process inline test cases
    while ((match = this.inlineRegex.exec(text)) !== null) {
      const testName = match[1];
      const parentTestFunction = await findParentTestFunction(document.fileName, testName);
      if (!parentTestFunction) {
        continue;
      }

      const startPosition = document.positionAt(match.index);
      const range = new vscode.Range(startPosition, startPosition);

      codeLenses.push(
        new vscode.CodeLens(range, {
          title: `run test`,
          command: 'go-test-decorator.runTest',
          arguments: [testName],
        }),
        new vscode.CodeLens(range, {
          title: `debug test`,
          command: 'go-test-decorator.debugTest',
          arguments: [testName],
        })
      );
    }

    return codeLenses;
  }
}