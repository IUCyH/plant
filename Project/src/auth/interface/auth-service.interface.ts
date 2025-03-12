import { ACCESS_TOKEN_EXPIRATION } from "../../common/helpers/token-helper.service";

export const AUTH_SERVICE = "AuthService";

export interface IAuthService {
    checkAdminAccount(id: string, password: string): boolean;
    getAccessToken(id: number, exp: (typeof ACCESS_TOKEN_EXPIRATION)["DEFAULT" | "TEMPORARY"]): Promise<string>;
    getRefreshToken(id: number): Promise<string>;
    getTokenVersion(): string;
    updateAccessTokenVersion(id: number, version: string): Promise<void>;
    updateRefreshTokenVersion(id: number, version: string): Promise<void>;
}