import { ApiProperty } from "@nestjs/swagger";

export class AccessTokenDto {
    @ApiProperty({ example: "eyj.soeifjose.cjohgeios", description: "액세스 토큰" })
    accessToken: string = "";

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }
}