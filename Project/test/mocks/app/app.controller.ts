import { Controller, Get } from "@nestjs/common";
import { MockAppService } from "./app.service";

@Controller()
export class MockAppController {
    constructor(private readonly appService: MockAppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get("/health")
    healthCheck(): string {
        return this.appService.healthCheck();
    }
}