import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto {
    @ApiProperty({ example: "abc1234", description: "유저의 uid" })
    uid?: string = undefined;

    @ApiProperty({ example: "홍길동", description: "유저의 이름(닉네임)" })
    name?: string = undefined;
}