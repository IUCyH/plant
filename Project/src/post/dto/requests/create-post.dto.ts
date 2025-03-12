import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePostDto {
    @IsNotEmpty()
    @ApiProperty({ example: "제목", description: "게시물의 제목" })
    title: string = "";

    @IsNotEmpty()
    @ApiProperty({ example: "내용", description: "게시물의 내용" })
    content: string = "";
}