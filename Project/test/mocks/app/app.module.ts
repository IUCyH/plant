import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TestOrmConfig } from "../../test-orm.config";
import { WinstonModule } from "nest-winston";
import { LogConfig } from "../../../src/configs/log.config";
import { GlobalSharedModule } from "../../../src/shared/global-shared.module";
import { MockAppController } from "./app.controller";
import { MockAppService } from "./app.service";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { QueryExceptionLoggingFilter } from "../../../src/common/exceptionFilters/query-exception-logging.filter";
import { ServiceExceptionLoggingFilter } from "../../../src/common/exceptionFilters/service-exception-logging.filter";
import { DevLoggingInterceptor } from "../../../src/common/interceptors/dev-logging.interceptor";
import { ConfigModule } from "@nestjs/config";
import { RedisModule } from "@nestjs-modules/ioredis";

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true
        }),
        RedisModule.forRootAsync({
            useFactory: () => ({
                type: "single",
                options: {
                    host: "127.0.0.1",
                    port: 6379,
                    password: process.env.REDIS_PASSWORD
                }
            })
        }),
        TypeOrmModule.forRoot(TestOrmConfig),
        WinstonModule.forRoot(LogConfig),
        GlobalSharedModule
    ],
    controllers: [MockAppController],
    providers: [
        MockAppService,
        {
            provide: APP_FILTER,
            useClass: ServiceExceptionLoggingFilter
        },
        {
            provide: APP_FILTER,
            useClass: QueryExceptionLoggingFilter
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: DevLoggingInterceptor
        }
    ],
    exports: [
        TypeOrmModule,
        WinstonModule,
        GlobalSharedModule
    ]
})
export class MockAppModule {}