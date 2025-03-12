import { ServiceException } from "./parent/service-exception";

export class ProcessFailed extends ServiceException {
    constructor(message: string = "Process failed") {
        super(304, message);
    }
}