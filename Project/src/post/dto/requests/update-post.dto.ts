import { ApiProperty } from "@nestjs/swagger";

export class UpdatePostDto {
    @ApiProperty({ example: "제목", description: "게시물의 제목" })
    title?: string = undefined;

    @ApiProperty({ example: "내용", description: "게시물의 내용" })
    content?: string = undefined;
}