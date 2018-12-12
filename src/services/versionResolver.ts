import axios, { AxiosPromise, AxiosError, AxiosRequestConfig } from 'axios-https-proxy-fix'
import * as vscode from 'vscode'
import * as semver from 'semver'

import { Package, Dependencies } from '../models'
import { isLatest, isScoped, getRegistry, getProxyForAxios, isValidVersion } from '../helper/util'
import { UpdateError } from '../error'

export function fetchPkg(name: string, version: string): Promise<Package> {
  const url = getInfoAddress(name)

  const axiosConfig = getProxyForAxios() ? { proxy: getProxyForAxios() } : undefined

  return new Promise<Package>((resolve, reject) => {
    axios
      .get(url, axiosConfig as AxiosRequestConfig)
      .then(response => resolve(response.data))
      .catch((err: AxiosError) => {
        if (!err.response) {
          return reject(new Error(err.message))
        }
        if (err.response.status === 404) {
          return reject(
            new UpdateError(
              name,
              version,
              `module was not found, please check if the package name is valid or maybe you want to change a registry`
            )
          )
        }
        return reject(new UpdateError(name, version, err.message))
      })
  })
}

export function fetchPkgs(depends: Dependencies): Promise<Array<Package>> {
  const names: Array<string> = Object.keys(depends).filter(d => isValidVersion(depends[d]))

  return Promise.all(names.map(name => fetchPkg(name, depends[name])))
}

function getInfoAddress(name: string): string {
  const registry = getRegistry()

  if (isScoped(name)) {
    const finalName = '@' + encodeURIComponent(name.substr(1))
    return `${registry}${finalName}`
  }

  if (isLatest()) {
    return `${registry}${name}/latest`
  }

  return `${registry}${name}`
}
