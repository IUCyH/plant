import { ServiceException } from "./parent/service-exception";

export class EntityNotFound extends ServiceException {
    constructor(message: string = "Data not found") {
        super(404, message);
    }
}