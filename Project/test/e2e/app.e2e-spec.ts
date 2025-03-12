import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { APP_FILTER } from "@nestjs/core";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { WinstonModule } from "nest-winston";
import { LogConfig } from "../../src/configs/log.config";
import { TypeHelperService } from "../../src/common/helpers/type-helper.service";
import { ServiceExceptionLoggingFilter } from "../../src/common/exceptionFilters/service-exception-logging.filter";
import { DevLoggingInterceptor } from "../../src/common/interceptors/dev-logging.interceptor";
import { MockAppController } from "../mocks/app/app.controller";
import { MockAppService } from "../mocks/app/app.service";

describe("App", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                WinstonModule.forRoot(LogConfig)
            ],
            controllers: [MockAppController],
            providers: [
                MockAppService,
                TypeHelperService,
                {
                    provide: APP_FILTER,
                    useClass: ServiceExceptionLoggingFilter
                },
                {
                    provide: APP_INTERCEPTOR,
                    useClass: DevLoggingInterceptor
                }
            ]
        }).compile();
        app = module.createNestApplication();

        await app.init();
    });

    it("should be logged", async () => {
        const tasks = [
            request.default(app.getHttpServer()).get("/"),
            request.default(app.getHttpServer()).get("/health")
        ];

        const results = await Promise.all(tasks);

        expect(results[0].status).toBe(404);
        expect(results[1].status).toBe(200);
    });

    afterAll(async () => {
        await app.close();
    });
});