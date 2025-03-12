import { ApiProperty } from "@nestjs/swagger";

export class RequestFailedDto {
    @ApiProperty({ example: 500 })
    statusCode: number = 0;

    @ApiProperty({ example: "Error processing this request" })
    message: string = "";

    @ApiProperty({ example: { message: "Error processing this request" } })
    response?: object = undefined;

    constructor(statusCode: number, response?: string | object, message: string = "Error processing this request") {
        this.statusCode = statusCode;
        this.message = message;

        if(typeof response === "string") {
            response = { message: response };
        }
        this.response = response;
    }
}