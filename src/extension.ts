import * as vscode from 'vscode';
import { GoTestCodeLensProvider } from './codelens/code_lens_provider';
import { runTestCommand } from './commands/test_command';
import { runDebugCommand } from './commands/debug_command';

export function activate(context: vscode.ExtensionContext) {
	console.log('[INFO] Extension activated.');
	
	context.subscriptions.push(vscode.commands.registerCommand(
		'go-test-decorator.runTest', runTestCommand));

	context.subscriptions.push(vscode.commands.registerCommand(
		'go-test-decorator.debugTest', runDebugCommand));

	context.subscriptions.push(vscode.languages.registerCodeLensProvider(
		{ language: 'go', scheme: 'file' },
		new GoTestCodeLensProvider()
	));
}

export function deactivate() {
	console.log('[INFO] Extension deactivated.');
}
