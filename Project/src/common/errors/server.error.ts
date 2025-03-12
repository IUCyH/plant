import { ServiceException } from "./parent/service-exception";

export class ServerError extends ServiceException {
    constructor(message: string = "Internal Server Error") {
        super(500, message);
    }
}