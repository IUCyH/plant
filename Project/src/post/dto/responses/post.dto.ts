import { UserInfo } from "../../../common/types/user-info.type";
import { ApiProperty } from "@nestjs/swagger";

export class PostDto {
    @ApiProperty({ example: 1, description: "게시물의 id" })
    id: number = 0;

    @ApiProperty({ example: "제목", description: "게시물의 제목" })
    title: string = "";

    @ApiProperty({ example: "내용", description: "게시물의 내용" })
    content: string = "";

    @ApiProperty({ example: 0, description: "게시물에 등록된 댓글 개수" })
    commentCount: number = 0;

    @ApiProperty({ example: "2025-02-26T20:09:12.989+09:00", description: "게시물을 등록한 날짜" })
    createAt: string = "";

    @ApiProperty({ example: { id: 2, name: "홍길동" }, description: "게시물을 등록한 유저" })
    user?: UserInfo = { id: 0, name: "" };

    constructor(
        id: number,
        title: string,
        content: string,
        commentCount: number,
        createAt: string,
        user?: UserInfo,
    ) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.commentCount = commentCount;
        this.createAt = createAt;
        this.user = user;
    }
}