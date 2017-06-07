import * as vscode from 'vscode';
import * as getPkgs from 'get-pkgs';

import { Dependencies, Pkg, Package } from '../models';

export function readPkgs(depends: Dependencies): Promise<Array<Pkg>> {

    return new Promise((resolve, reject) => {
        getPkgs(Object.keys(depends).filter(d => /\d+\.\d+\.\d+/.test(depends[d])), (err, pkgs: Array<Package>) => {
            if (err) {
                return reject(err);
            }
            resolve(pkgs.map(p => {
                return {
                    name: p.name,
                    version: depends[p.name],
                    latestVersion: latestVersion(p, version(depends[p.name]))
                };
            }));
        });
    });
}

export function writePkgs(raw: vscode.TextEditor, pkgs: Array<Pkg>): Thenable<boolean> {
    const LINE_BREAK = raw.document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n';
    const rawPackageDoc = raw.document;
    const rawPackageText: Array<string> = raw.document.getText().split(LINE_BREAK);
    const targetPackageText: Array<string> = rawPackageText.map(line => {
        const found: Pkg = isDependencyLine(line, pkgs);
        if (!found) {
            return line;
        }
        return line.replace(version(found.version), found.latestVersion);
    });

    return raw.edit((editBuilder: vscode.TextEditorEdit) => {
        editBuilder.replace(new vscode.Range(rawPackageDoc.positionAt(0), rawPackageDoc.positionAt(raw.document.getText().length)), targetPackageText.join(LINE_BREAK));
    })
        .then(result => {
            if (!result) {
                return false;
            }
            return rawPackageDoc.save();
        });
}


function isDependencyLine(line: string, pkgs: Array<Pkg>): Pkg {
    return pkgs.find(p => line.includes(`"${p.name}"`) && line.includes(`${p.version}`));
}

function version(raw: string): string {
    return raw.replace(/[~^<>=]/g, '');
}

function latestVersion(pkg: Package, fallback: string): string {
    if (pkg.version) {
        return pkg.version;
    }
    if (pkg['dist-tags'] && pkg['dist-tags'].latest) {
        return pkg['dist-tags'].latest;
    }
    return fallback;
}