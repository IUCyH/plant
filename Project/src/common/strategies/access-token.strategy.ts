import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { TokenVersionService } from "../../tokenVersion/token-version.service";
import { TokenPayload } from "../types/token-payload.type";
import { UserInfo } from "../types/user-info.type";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(private readonly tokenVersionService: TokenVersionService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_KEY ?? ""
        });
    }

    async validate(payload: TokenPayload) {
        if(!payload.typ || payload.typ !== "access") {
            throw new UnauthorizedException("Invalid token");
        }

        const currVersion = await this.tokenVersionService.getVersion("access", payload.sub);
        if(!currVersion || currVersion !== payload.jti) {
            throw new UnauthorizedException("Invalid token");
        }

        const user: UserInfo = { id: payload.sub, name: "" };
        return user;
    }
}