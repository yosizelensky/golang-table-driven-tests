import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as path from 'path';
import { findParentTestFunction } from '../utils/parent_test_function_finder';

let testOutputChannel: vscode.OutputChannel | undefined;

export async function runTestCommand(testName: string) {
  const sanitizedTestName = testName.replace(/\s+/g, '_');
  console.log(`[INFO] Run test command triggered for: ${sanitizedTestName}`);

  const testFile = vscode.window.activeTextEditor?.document.uri.fsPath;

  if (!testFile) {
    vscode.window.showErrorMessage('No active test file found.');
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
  const command = `go test -run ${fullTestPath} ${testFileDir === '.' ? '' : `./${testFileDir}`}`.trim();

  // Create or reuse an output channel
  if (!testOutputChannel) {
    testOutputChannel = vscode.window.createOutputChannel('Go Test Output');
  }
  testOutputChannel.clear();
  testOutputChannel.show(true);

  // Execute the command
  try {
    testOutputChannel.appendLine(`[INFO] Running command: ${command}\n`);
    const process = childProcess.exec(command, { cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath });

    process.stdout?.on('data', (data) => {
      testOutputChannel?.append(data.toString());
    });

    process.stderr?.on('data', (data) => {
      testOutputChannel?.append(data.toString());
    });

    process.on('exit', (code) => {
      const status = code === 0 ? 'SUCCESS' : 'FAILURE';
      testOutputChannel?.appendLine(`\n[INFO] Command completed with status: ${status} (exit code ${code})`);
    });

  } catch (error) {
    console.error(`[ERROR] Failed to run test: ${error}`);
    testOutputChannel.appendLine(`[ERROR] Failed to run test: ${error}`);
    vscode.window.showErrorMessage(`Failed to run test: ${error}`);
  }
}
