import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const Token = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<Request>();
        return request.headers.authorization?.split(" ")[1];
    }
);