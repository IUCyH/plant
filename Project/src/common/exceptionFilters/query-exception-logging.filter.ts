import {
    ExceptionFilter,
    Injectable,
    Inject,
    Catch,
    ArgumentsHost
} from "@nestjs/common";
import { Request, Response } from "express";
import { TypeORMError } from "typeorm";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { LoggerService } from "@nestjs/common";
import { RequestFailedDto } from "../dto/responses/request-failed.dto";

@Injectable()
@Catch(TypeORMError)
export class QueryExceptionLoggingFilter implements ExceptionFilter {
    constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER)
                private readonly logger: LoggerService,
    ) {}

    catch(exception: TypeORMError, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const request = context.getRequest<Request>();
        const message = exception.message;
        let status = 500;

        if(message.includes("ER_DUP_ENTRY")) {
            status = 400;
        }

        this.logger.error(`${request.method} ${request.url} ${ status }: ${message}`, "QueryExceptionLoggingFilter");

        const error = new RequestFailedDto(status);
        response.status(status).json(error);
    }
}