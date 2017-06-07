// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

import { readPkgs, writePkgs } from './services/pkgManager';

import { Pkg, Package } from './models';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "npm-dependency" is now active!');


    const disposable = vscode.commands.registerCommand('extension.npmDepUpdateLatest', async function () {
        // The code you place here will be executed every time your command is executed

        if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document || path.basename(vscode.window.activeTextEditor.document.fileName) !== 'package.json') {
            vscode.window.showWarningMessage('You have to select a package.json');
            return;
        }

        try {
            const pkg: Package = JSON.parse(vscode.window.activeTextEditor.document.getText());

            const hide = vscode.window.setStatusBarMessage('dependencies checking....');

            const depends: Array<Pkg> = await readPkgs(pkg.dependencies);
            const devDepends: Array<Pkg> = await readPkgs(pkg.devDependencies);

            await writePkgs(vscode.window.activeTextEditor, depends.concat(devDepends));

            hide.dispose();

            vscode.window.setStatusBarMessage('pakcage.json updated', 3000);

        } catch (error) {
            vscode.window.showErrorMessage('your package.json is invalid');
        }



    });

    context.subscriptions.push(disposable);

}

// this method is called when your extension is deactivated
export function deactivate() {
}