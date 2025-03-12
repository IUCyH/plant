import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokenPayload } from "../types/token-payload.type";

export const TOKEN_TYPE = {
    ACCESS: "access",
    REFRESH: "refresh"
}  as const;

export const ACCESS_TOKEN_EXPIRATION = {
    DEFAULT: "15m",
    TEMPORARY: "3m"
} as const;

@Injectable()
export class TokenHelperService {
    constructor(private readonly jwtService: JwtService) {}

    sign(payload: TokenPayload, exp?: string) {
        const token = this.jwtService.sign(payload, {
            algorithm: "HS256",
            expiresIn: exp ?? "30d"
        });
        return token;
    }
}