import * as vscode from 'vscode'
import * as semver from 'semver'
import * as parse from 'url-parse'

interface axiosConfigProxy {
  host: string
  port?: number
  username?: string
  password?: string
}

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

export function getProxyForAxios(): axiosConfigProxy | undefined {
  const config = vscode.workspace.getConfiguration('http')
  const rawProxy = config.get<string>('proxy')
  if (!rawProxy) {
    return undefined
  }
  const res = parse(rawProxy)
  const param: axiosConfigProxy = {
    host: res.hostname
  }
  if (res.port) {
    param.port = +res.port
  }
  if (res.username) {
    param.username = res.username
  }
  if (res.password) {
    param.password = res.password
  }
  return param
}

export function version(raw: string): string {
  return raw.replace(/[~^<>=]/g, '')
}

export function isValidVersion(src: string): boolean {
  return semver.valid(version(src))
}
