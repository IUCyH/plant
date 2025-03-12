export class ServiceException extends Error {
    readonly status: number = 0;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}