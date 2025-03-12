import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateReplyDto {
    @IsNotEmpty()
    @ApiProperty({ example: "내용", description: "답글의 내용" })
    content: string = "";
}