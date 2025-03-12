import {
    ExceptionFilter,
    Injectable,
    Inject,
    Catch,
    ArgumentsHost
} from "@nestjs/common";
import { HttpException } from "@nestjs/common";
import { Request, Response } from "express";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { LoggerService } from "@nestjs/common";
import { RequestFailedDto } from "../dto/responses/request-failed.dto";

@Injectable()
@Catch(HttpException)
export class HttpExceptionLoggingFilter implements ExceptionFilter {
    constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER)
                private readonly logger: LoggerService,
    ) {}

    catch(exception: HttpException, host: ArgumentsHost): any {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const request = context.getRequest<Request>();
        const status = exception.getStatus();
        const responseBody = exception.getResponse();
        const message = exception.message;

        this.logger.error(`${request.method} ${request.url} ${status}: ${message}`, "HttpExceptionLoggingFilter");

        const error = new RequestFailedDto(status, responseBody, message);
        response.status(status).json(error);
    }
}