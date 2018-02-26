import * as vscode from 'vscode'
import * as semver from 'semver'
import { fetchPkgs } from './versionResolver'

import { Dependencies, Pkg, Package } from '../models'
import { isLatest, version } from '../helper/util'

export function readPkgs(depends: Dependencies): Promise<Array<Pkg>> {
  if (!depends) {
    return Promise.resolve([])
  }

  return fetchPkgs(depends).then(data => {
    return data.map(d => ({
      name: d.name,
      version: depends[d.name],
      latestVersion: latestVersion(d, depends[d.name])
    }))
  })
}

export function writePkgs(raw: vscode.TextEditor, pkgs: Array<Pkg>): Thenable<boolean> {
  const LINE_BREAK = raw.document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n'
  const rawPackageDoc = raw.document
  const rawPackageText: Array<string> = raw.document.getText().split(LINE_BREAK)
  const targetPackageText: Array<string> = rawPackageText.map(line => {
    const found: Pkg = isDependencyLine(line, pkgs)
    if (!found) {
      return line
    }
    return line.replace(version(found.version), found.latestVersion)
  })

  return raw
    .edit((editBuilder: vscode.TextEditorEdit) => {
      editBuilder.replace(
        new vscode.Range(
          rawPackageDoc.positionAt(0),
          rawPackageDoc.positionAt(raw.document.getText().length)
        ),
        targetPackageText.join(LINE_BREAK)
      )
    })
    .then(result => {
      if (!result) {
        return false
      }
      return rawPackageDoc.save()
    })
}

function isDependencyLine(line: string, pkgs: Array<Pkg>): Pkg {
  return pkgs.find(p => line.includes(`"${p.name}"`) && line.includes(`${p.version}`))
}

function latestVersion(pkg: Package, fallback: string): string {
  if (isLatest()) {
    if (pkg.version) {
      return pkg.version
    }
    if (pkg['dist-tags'] && pkg['dist-tags'].latest) {
      return pkg['dist-tags'].latest
    }
    return version(fallback)
  }

  if (!pkg.versions) {
    return version(fallback)
  }

  return semver.maxSatisfying(Object.keys(pkg.versions), fallback)
}
