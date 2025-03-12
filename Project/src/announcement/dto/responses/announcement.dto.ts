import { UserInfo } from "../../../common/types/user-info.type";
import { ApiProperty } from "@nestjs/swagger";

export class AnnouncementDto {
    @ApiProperty({ example: 1, description: "공지사항의 id" })
    id: number = 0;

    @ApiProperty({ example: "제목", description: "공지사항의 제목" })
    title: string = "";

    @ApiProperty({ example: "내용", description: "공지사항의 내용" })
    content: string = "";

    @ApiProperty({ example: "2025-02-26T20:09:12.989+09:00", description: "공지사항을 작성한 날짜" })
    createAt: string = "";

    @ApiProperty({ example: { id: 1, name: "관리자" }, description: "공지사항을 작성한 유저의 정보" })
    user?: UserInfo = { id: 0, name: "" };

    constructor(
        id: number,
        title: string,
        content: string,
        createAt: string,
        user?: UserInfo,
    ) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createAt = createAt;
        this.user = user;
    }
}