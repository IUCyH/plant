import { ServiceException } from "./parent/service-exception";

export class DataAlreadyExists extends ServiceException {
    constructor(message: string = "Data Already Exists") {
        super(400, message);
    }
}