import { IsNotEmpty, IsPhoneNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @IsNotEmpty()
    @ApiProperty({ example: "abc1234", description: "유저의 uid, oauth 로그인 시 404가 반환되면, 회원가입 시 사용할 수 있는 uid가 반환되니 그 값을 넘겨주시면 됩니다." })
    uid: string = "";

    @IsNotEmpty()
    @ApiProperty({ example: "홍길동", description: "유저의 이름(닉네임)" })
    name: string = "";

    @IsNotEmpty()
    @IsPhoneNumber("KR")
    @ApiProperty({ example: "+821012345678", description: "유저의 전화번호" })
    phone: string = "";

    @IsNotEmpty()
    @ApiProperty({ example: "kakao", description: "oauth 로그인 제공자, kakao, naver, google 중 하나여야 합니다." })
    provider: string = "";
}