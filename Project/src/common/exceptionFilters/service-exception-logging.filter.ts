import {
    ExceptionFilter,
    Injectable,
    Inject,
    Catch,
    ArgumentsHost
} from "@nestjs/common";
import { Request, Response } from "express";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { ServiceException } from "../errors/parent/service-exception";
import { LoggerService } from "@nestjs/common";
import { RequestFailedDto } from "../dto/responses/request-failed.dto";

@Injectable()
@Catch(ServiceException)
export class ServiceExceptionLoggingFilter implements ExceptionFilter {
    constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER)
                private readonly logger: LoggerService,
    ) {}

    catch(exception: ServiceException, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const request = context.getRequest<Request>();
        const status = exception.status;
        const message = exception.message;

        this.logger.error(`${request.method} ${request.url} ${status}: ${message}`, "ServiceExceptionLoggingFilter");

        const error = new RequestFailedDto(status);
        response.status(status).json(error);
    }
}