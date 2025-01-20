import * as vscode from 'vscode';
import * as path from 'path';
import { findParentTestFunction } from '../utils/parent_test_function_finder';

export async function runDebugCommand(testName: string) {
  const sanitizedTestName = testName.replace(/\s+/g, '_');
  console.log(`[INFO] Debug test command triggered for: ${sanitizedTestName}`);

  const testFile = vscode.window.activeTextEditor?.document.uri.fsPath;
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder || !testFile) {
    vscode.window.showErrorMessage('No workspace folder or active test file found.');
    return;
  }

  const parentTestFunction = await findParentTestFunction(testFile, testName);
  if (!parentTestFunction) {
    vscode.window.showErrorMessage(`Could not find the parent test function for: ${sanitizedTestName}`);
    return;
  }

  const fullTestPath = `${parentTestFunction}/${sanitizedTestName}`;
  const testFileRelativePath = vscode.workspace.asRelativePath(testFile);
  const testFileDir = path.dirname(testFileRelativePath);
  const args: string[] = ['-test.run', fullTestPath];
  let program = workspaceFolder.uri.fsPath;

  if (testFileDir !== '.') {
    args.push(`./${testFileDir}`);
    program = `${program}/${testFileDir}`;
  }

  const debugConfig: vscode.DebugConfiguration = {
    name: `Debug Go Test: ${fullTestPath}`,
    type: 'go',
    request: 'launch',
    mode: 'test',
    program: program,
    args,
  };

  try {
    const started = await vscode.debug.startDebugging(workspaceFolder, debugConfig);
    if (!started) {
      throw new Error('Failed to start debugging.');
    }
    await vscode.commands.executeCommand('workbench.debug.action.focusRepl');
    console.log(`[INFO] Debugger started successfully for test: ${fullTestPath}`);
  } catch (error) {
    console.error(`[ERROR] Failed to debug test for ${fullTestPath}:`, error);
    vscode.window.showErrorMessage(`Failed to debug test: ${fullTestPath}`);
  }
}
