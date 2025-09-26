import * as vscode from 'vscode';
import * as path from 'path';
import { findParentTestFunction } from '../utils/parent_test_function_finder';
import { escapeTestNameForRegex, sanitizeTestNameForPath } from '../utils/test_name_utils';

export async function runDebugCommand(testName: string) {
  const sanitizedTestName = sanitizeTestNameForPath(testName);
  const escapedTestName = escapeTestNameForRegex(testName);

  const testFile = vscode.window.activeTextEditor?.document.uri.fsPath;
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder || !testFile) {
    vscode.window.showErrorMessage('No workspace folder or active test file found.');
    return;
  }

  const parentTestFunction = await findParentTestFunction(testFile, testName);
  if (!parentTestFunction) {
    vscode.window.showErrorMessage(`Could not find the parent test function for: ${testName}`);
    return;
  }

  // Check if this is a suite test method
  const fs = require('fs');
  const fileContent = fs.readFileSync(testFile, 'utf8');
  const suiteMethodRegex = new RegExp(`func\\s+\\([^)]+\\)\\s+${parentTestFunction}\\s*\\(`);
  const isSuiteMethod = suiteMethodRegex.test(fileContent);

  let fullTestPath = `${parentTestFunction}/${escapedTestName}`;

  if (isSuiteMethod) {
    // For suite methods, find the actual test function that runs the suite
    const suiteTestRegex = /func\s+(Test\w*Suite)\s*\(/g;
    let match;
    while ((match = suiteTestRegex.exec(fileContent)) !== null) {
      const suiteTestName = match[1];
      if (fileContent.includes(`${suiteTestName}`) && fileContent.includes(parentTestFunction)) {
        fullTestPath = `${suiteTestName}/${parentTestFunction}/${escapedTestName}`;
        break;
      }
    }
  }

  // Use the directory containing the test file as the program path
  const testFileDir = path.dirname(testFile);

  const debugConfig: vscode.DebugConfiguration = {
    name: `Debug Go Test: ${testName}`,
    type: 'go',
    request: 'launch',
    mode: 'test',
    program: testFileDir,
    args: [
      '-test.run',
      `^${fullTestPath}$`  // Use regex anchors for exact match
    ],
    showLog: true
  };

  try {
    const started = await vscode.debug.startDebugging(workspaceFolder, debugConfig);
    if (!started) {
      throw new Error('Failed to start debugging.');
    }
    // Focus on the debug console
    await vscode.commands.executeCommand('workbench.debug.action.focusRepl');
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to debug test: ${fullTestPath}`);
  }
}