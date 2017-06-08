// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

import { readPkgs, writePkgs } from './services/pkgManager';

import { Pkg, Package } from './models';
import { UpdateError } from './error';

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

        const doc = vscode.window.activeTextEditor.document;
        const diagnosticCollection = vscode.languages.createDiagnosticCollection('npm-dependency');

        const hide = vscode.window.setStatusBarMessage('dependencies checking....');
        diagnosticCollection.clear();

        try {
            const pkg: Package = JSON.parse(doc.getText());

            const depends: Array<Array<Pkg>> = await Promise.all([readPkgs(pkg.dependencies), readPkgs(pkg.devDependencies)]);

            await writePkgs(vscode.window.activeTextEditor, depends.reduce((p, c) => p.concat(c), []));

            vscode.window.setStatusBarMessage('pakcage.json updated', 3000);

        } catch (error) {
            const err: UpdateError = <UpdateError>error;
            if (!err.moduleName) {
                return vscode.window.showErrorMessage(err.message + '. Please check if your registry is accessible');
            }
            const diagnostic = new vscode.Diagnostic(findRange(err.moduleName, err.version, doc), err.message, vscode.DiagnosticSeverity.Error);
            diagnosticCollection.set(doc.uri, [diagnostic]);

            vscode.window.setStatusBarMessage('pakcage.json update failed', 4500);
        } finally {
            hide.dispose();
        }

    });

    context.subscriptions.push(disposable);

}

function findRange(name: string, version: string, doc: vscode.TextDocument): vscode.Range {
    const LINE_BREAK = doc.eol === vscode.EndOfLine.LF ? '\n' : '\r\n';
    const lines: Array<string> = doc.getText().split(LINE_BREAK);

    const foundLine: number = lines.findIndex(line => line.includes(`"${name}"`) && line.includes(`${version}`));
    const foundColumn: number = lines[foundLine].indexOf(name);

    return new vscode.Range(foundLine, foundColumn,
        foundLine, foundColumn + name.length);
}

// this method is called when your extension is deactivated
export function deactivate() {
}