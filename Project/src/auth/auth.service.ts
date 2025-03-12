import { v4 as uuid } from "uuid";
import { Injectable } from "@nestjs/common";
import { ProcessFailed } from "../common/errors/process-failed.error";
import { TokenPayload } from "../common/types/token-payload.type";
import { TokenHelperService, ACCESS_TOKEN_EXPIRATION } from "../common/helpers/token-helper.service";
import { TokenVersionService } from "../tokenVersion/token-version.service";
import { IAuthService } from "./interface/auth-service.interface";

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        private readonly tokenHelperService: TokenHelperService,
        private readonly tokenVersionService: TokenVersionService
    ) {}

    // 환경변수(.env)에 저장된 아이디,비밀번호를 불러와 비교 후 처리
    checkAdminAccount(id: string, password: string): boolean {
        const adminId = process.env.ADMIN_ID;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if(!adminId || !adminPassword) {
            throw new ProcessFailed("Admin account info not found");
        }

        if(id !== adminId || password !== adminPassword) {
            return false;
        }
        return true;
    }

    async getAccessToken(id: number, exp: (typeof ACCESS_TOKEN_EXPIRATION)["DEFAULT" | "TEMPORARY"]): Promise<string> {
        const version = this.getTokenVersion();
        const payload: TokenPayload = {
            typ: "access",
            sub: id,
            jti: version
        };

        const token = this.tokenHelperService.sign(payload, exp);
        await this.updateAccessTokenVersion(id, version);

        return token;
    }

    async getRefreshToken(id: number): Promise<string> {
        const version = this.getTokenVersion();
        const payload: TokenPayload = {
            typ: "refresh",
            sub: id,
            jti: version
        };

        const token = this.tokenHelperService.sign(payload);
        await this.updateRefreshTokenVersion(id, version);

        return token;
    }

    getTokenVersion(): string {
        const version = uuid().replace(/-/g, "");
        return version;
    }

    async updateAccessTokenVersion(id: number, version: string): Promise<void> {
        await this.tokenVersionService.upsertVersion("access", version, id);
    }

    async updateRefreshTokenVersion(id: number, version: string): Promise<void> {
        await this.tokenVersionService.upsertVersion("refresh", version, id);
    }
}