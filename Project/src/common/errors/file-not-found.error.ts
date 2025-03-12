import { ServiceException } from "./parent/service-exception";

export class FileNotFound extends ServiceException {
    constructor(message: string = "File not found") {
        super(404, message);
    }
}