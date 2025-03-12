import {
    LoggerService,
    Injectable,
    Inject,
    NestInterceptor,
    ExecutionContext,
    CallHandler
} from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class DevLoggingInterceptor implements NestInterceptor {
    constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService) {}

    intercept<T>(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, params, query } = request;
        const now = Date.now();

        return next.handle().pipe(
            tap(() => {
                const ms = Date.now() - now;

                this.logger.log(`Request: ${method} ${url}: body - ${JSON.stringify(body)}, param - ${JSON.stringify(params)}, query - ${JSON.stringify(query)}`, "DevLoggingInterceptor");
                this.logger.log(`Response: ${method} ${url} - ${ms}ms`, "DevLoggingInterceptor");
            })
        );
    }
}