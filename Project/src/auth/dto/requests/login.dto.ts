import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @IsNotEmpty()
    @ApiProperty({ example: "admin1234", description: "사전에 받은 관리자용 id" })
    id: string = "";

    @IsNotEmpty()
    @ApiProperty({ example: "aabc1234", description: "사전에 받은 관리자용 password" })
    password: string = "";
}