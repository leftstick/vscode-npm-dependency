import * as vscode from 'vscode'
import * as semver from 'semver'

export function isScoped(name: string): boolean {
  return name.startsWith('@')
}

export function isLatest(): boolean {
  const config = vscode.workspace.getConfiguration('npm')
  return config.get<string>('updateStrategy') === 'LATEST'
}

export function getRegistry(): string {
  const config = vscode.workspace.getConfiguration('npm')
  const registry = config.get<string>('registry')

  if (!registry.endsWith('/')) {
    return registry + '/'
  }
  return registry
}

export function version(raw: string): string {
  return raw.replace(/[~^<>=]/g, '')
}

export function isValidVersion(src: string): boolean {
  return semver.valid(version(src))
}
