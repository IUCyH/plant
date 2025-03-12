import { UserInfo } from "../../../../common/types/user-info.type";
import { ApiProperty } from "@nestjs/swagger";

export class CommentDto {
    @ApiProperty({ example: 1, description: "댓글의 id" })
    id: number = 0;

    @ApiProperty({ example: "내용", description: "댓글의 내용" })
    content: string = "";

    @ApiProperty({ example: "2025-02-26T20:09:12+09:00", description: "댓글의 작성 날짜" })
    createAt: string = "";

    @ApiProperty({ example: { id: 2, name: "홍길동" }, description: "댓글을 작성한 유저" })
    user: UserInfo = { id: 0, name: "" };

    constructor(
        id: number,
        content: string,
        createAt: string,
        user: UserInfo
    ) {
        this.id = id;
        this.content = content;
        this.createAt = createAt;
        this.user = user;
    }
}