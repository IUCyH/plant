import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAnnouncementDto {
    @IsNotEmpty()
    @ApiProperty({ example: "제목", description: "공지사항의 제목" })
    title: string = "";

    @IsNotEmpty()
    @ApiProperty({ example: "내용", description: "공지사항의 내용" })
    content: string = "";
}