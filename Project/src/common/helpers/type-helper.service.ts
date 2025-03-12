import { Injectable } from "@nestjs/common";

@Injectable()
export class TypeHelperService {
    isString(value: unknown): value is string {
        return typeof value === "string";
    }

    isError(value: unknown): value is Error {
        return value instanceof Error;
    }
}