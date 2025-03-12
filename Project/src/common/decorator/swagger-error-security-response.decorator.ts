import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { RequestFailedDto } from "../dto/responses/request-failed.dto";

export const SwaggerErrorSecurityResponse = () => {
    return applyDecorators(
        ApiResponse({ status: 400, description: "Bad Request", type: RequestFailedDto }),
        ApiResponse({ status: 401, description: "Unauthorized", type: RequestFailedDto }),
        ApiResponse({ status: 500, description: "Internal Server Error", type: RequestFailedDto })
    );
};