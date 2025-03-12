import { ApiProperty } from "@nestjs/swagger";

export class TokenPairDto {
    @ApiProperty({ example: "eyj.sefjose.cjosf", description: "액세스 토큰" })
    accessToken: string = "";

    @ApiProperty({ example: "eyj.scyrjda.seoifsoei", description: "리프레시 토큰" })
    refreshToken: string = "";

    constructor(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}