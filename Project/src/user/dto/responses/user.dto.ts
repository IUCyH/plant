import { ApiProperty } from "@nestjs/swagger";

export class UserDto {
    @ApiProperty({ example: 2, description: "유저의 id"})
    id: number = 0;

    @ApiProperty({ example: "abc1234", description: "유저의 uid" })
    uid: string = "";

    @ApiProperty({ example: "kakao", description: "로그인 제공자, kakao, naver, google" })
    provider: string = "";

    @ApiProperty({ example: "user", description: "유저의 역할, 모든 유저는 user 이고, 운영자만 admin 입니다." })
    role: string = "";

    @ApiProperty({ example: "홍길동", description: "유저의 이름(닉네임)" })
    name: string = "";

    @ApiProperty({ example: false, description: "유저의 프로필 이미지가 존재하는 지 여부" })
    hasProfileImage: boolean = false;

    constructor(
        id: number,
        uid: string,
        provider: string,
        role: string,
        name: string,
        hasProfileImage: boolean,
    ) {
        this.id = id;
        this.uid = uid;
        this.provider = provider;
        this.role = role;
        this.name = name;
        this.hasProfileImage = hasProfileImage;
    }
}