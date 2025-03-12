import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SocialLoginDto {
    @IsNotEmpty()
    @ApiProperty({ example: "ajsioefjsch4r43o", description: "앱에서 얻은 fcm 토큰" })
    fcmToken: string = "";
}