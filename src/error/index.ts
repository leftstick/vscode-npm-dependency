

export class UpdateError extends Error {
    constructor(public moduleName: string, public version: string, public message: string) {
        super(message);
    }
}