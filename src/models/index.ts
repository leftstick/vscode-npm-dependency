export interface Dependencies {
  [key: string]: string
}

export interface Pkg {
  name: string
  version: string
  latestVersion: string
}

export interface Package {
  name: string
  version?: string
  versions?: { [version: string]: any }
  description?: string
  'dist-tags'?: { [key: string]: string }
  homepage?: string
  icon?: string
  license?: string
  keywords?: Array<string>
  author?: any
  contributors?: any
  repository?: any
  scripts?: { [key: string]: string }
  dependencies?: Dependencies
  bugs?: { [key: string]: string }
  devDependencies?: Dependencies
}
