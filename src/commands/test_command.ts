import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as path from 'path';
import { findParentTestFunction } from '../utils/parent_test_function_finder';
import { escapeTestNameForRegex, sanitizeTestNameForPath } from '../utils/test_name_utils';

let testOutputChannel: vscode.OutputChannel | undefined;

export async function runTestCommand(testName: string) {
  const sanitizedTestName = sanitizeTestNameForPath(testName);
  const escapedTestName = escapeTestNameForRegex(testName);

  const testFile = vscode.window.activeTextEditor?.document.uri.fsPath;

  if (!testFile) {
    vscode.window.showErrorMessage('No active test file found.');
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

  // Determine package path
  let packagePath = '';
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  // Function to find go.mod by walking up the directory tree
  function findGoMod(startPath: string): string | null {
    const fs = require('fs');
    let currentPath = startPath;
    const root = path.parse(currentPath).root;

    while (currentPath !== root) {
      const goModPath = path.join(currentPath, 'go.mod');
      if (fs.existsSync(goModPath)) {
        return goModPath;
      }
      currentPath = path.dirname(currentPath);
    }
    return null;
  }

  try {
    const fs = require('fs');
    const goModPath = findGoMod(path.dirname(testFile));

    if (goModPath) {
      const goModContent = fs.readFileSync(goModPath, 'utf8');
      const moduleMatch = goModContent.match(/^module\s+(.+)$/m);

      if (moduleMatch) {
        const moduleName = moduleMatch[1].trim();
        const goModDir = path.dirname(goModPath);
        const relativeFromGoMod = path.relative(goModDir, path.dirname(testFile));

        if (relativeFromGoMod) {
          packagePath = `${moduleName}/${relativeFromGoMod.replace(/\\/g, '/')}`;
        } else {
          packagePath = moduleName;
        }
      }
    } else {
      // Fallback to relative path
      const testFileRelativePath = vscode.workspace.asRelativePath(testFile);
      const testFileDir = path.dirname(testFileRelativePath);
      packagePath = `./${testFileDir}`;
    }
  } catch (e) {
    const testFileRelativePath = vscode.workspace.asRelativePath(testFile);
    const testFileDir = path.dirname(testFileRelativePath);
    packagePath = `./${testFileDir}`;
  }

  // Use quotes around the test pattern to handle special characters
  const command = `go test -run "^${fullTestPath}$" ${packagePath}`.trim();

  // Create or reuse an output channel
  if (!testOutputChannel) {
    testOutputChannel = vscode.window.createOutputChannel('Go Test Output');
  }
  testOutputChannel.clear();
  testOutputChannel.show(true);

  // Execute the command
  try {
    testOutputChannel.appendLine(`[INFO] Running command: ${command}\n`);
    const process = childProcess.exec(command, { cwd: workspaceFolder });

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
    testOutputChannel.appendLine(`[ERROR] Failed to run test: ${error}`);
    vscode.window.showErrorMessage(`Failed to run test: ${error}`);
  }
}