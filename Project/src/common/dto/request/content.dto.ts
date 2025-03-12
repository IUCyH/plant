import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ContentDto {
    @IsNotEmpty()
    @ApiProperty({ example: "내용" })
    content: string = "";
}