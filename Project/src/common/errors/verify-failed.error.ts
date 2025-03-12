import { ServiceException } from "./parent/service-exception";

export class VerifyFailed extends ServiceException {
    constructor(message: string = "Verify failed") {
        super(401, message);
    }
}