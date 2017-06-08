import axios, { AxiosPromise, AxiosError } from 'axios';
import * as vscode from 'vscode';

import { Package, Dependencies } from '../models';
import { UpdateError } from '../error';

export function fetchPkg(name: string, version: string): Promise<Package> {
    const url = getInfoAddress(name);

    return new Promise<Package>((resolve, reject) => {
        axios
            .get(url)
            .then(response => resolve(response.data))
            .catch((err: AxiosError) => {
                if (!err.response) {
                    return reject(new Error(err.message));
                }
                if (err.response.status === 404) {
                    return reject(new UpdateError(name, version, `module was not found, please check if the package name is valid or maybe you want to change a registry`));
                }
                return reject(new UpdateError(name, version, err.message));
            });
    });
}

export function fetchPkgs(depends: Dependencies): Promise<Array<Package>> {

    const names: Array<string> = Object.keys(depends).filter(d => /\d+\.\d+\.\d+/.test(depends[d]));

    return Promise.all(names.map(name => fetchPkg(name, depends[name])));
}


function getRegistry(): string {
    const config = vscode.workspace.getConfiguration('npm');
    const registry = config.get<string>('registry');

    if (!registry.endsWith('/')) {
        return registry + '/';
    }
    return registry;
}

function getInfoAddress(name: string): string {
    let finalName = name;
    let finalVersion = 'latest';

    if (isScoped(name)) {
        finalName = '@' + encodeURIComponent(name.substr(1));
        finalVersion = '';
    }
    return getRegistry() + finalName + '/' + finalVersion;
}

function isScoped(name: string): boolean {
    return name.startsWith('@');
}
