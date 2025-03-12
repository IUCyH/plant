import { TOKEN_TYPE } from "../helpers/token-helper.service";

export interface TokenPayload {
    typ: (typeof TOKEN_TYPE)["ACCESS" | "REFRESH"];
    sub: number;
    jti: string;
}