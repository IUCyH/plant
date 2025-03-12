import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { HttpExceptionLoggingFilter } from "./common/exceptionFilters/http-exception.logging.filter";
import { QueryExceptionLoggingFilter } from "./common/exceptionFilters/query-exception-logging.filter";
import { ServiceExceptionLoggingFilter } from "./common/exceptionFilters/service-exception-logging.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";

import { GlobalSharedModule } from "./shared/global-shared.module";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { WinstonModule } from "nest-winston";
import { LogConfig } from "./configs/log.config";
import { RedisModule } from "@nestjs-modules/ioredis";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { AnnouncementModule } from "./announcement/announcement.module";
import { PostModule } from "./post/post.module";
import { CommentModule } from "./post/comment/comment.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true
        }),
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                type: "mariadb",
                host: "localhost",
                port: 3306,
                username: "example",
                password: process.env.DB_PASSWORD,
                database: "example",
                synchronize: false,
                logging: false,
                namingStrategy: new SnakeNamingStrategy(),
                extra: {
                    timezone: "Z",
                    dateStrings: true
                },
                entities: [__dirname + "/../**/*.entity.{js,ts}"],
                subscribers: [],
                migrations: []
            })
        }),
        WinstonModule.forRoot(LogConfig),
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
        GlobalSharedModule,
        UserModule,
        AuthModule,
        AnnouncementModule,
        PostModule,
        CommentModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: HttpExceptionLoggingFilter
        },
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
            useClass: LoggingInterceptor
        }
    ]
})
export class AppModule {}
