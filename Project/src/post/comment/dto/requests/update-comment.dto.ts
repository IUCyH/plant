import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCommentDto {
    @IsNotEmpty()
    @ApiProperty({ example: "내용", description: "댓글의 내용" })
    content: string = "";
}