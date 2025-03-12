import { Injectable } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";

@Injectable()
export class MockAppService {
    getHello(): string {
        throw new NotFoundException("Data not found");
    }

    healthCheck(): string {
        return "OK";
    }
}