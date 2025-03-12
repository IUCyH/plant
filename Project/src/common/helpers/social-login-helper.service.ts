import axios from "axios";
import { ServiceException } from "../errors/parent/service-exception";
import { VerifyFailed } from "../errors/verify-failed.error";
import { ServerError } from "../errors/server.error";

export const KAKAO = "kakao";
export const NAVER = "naver";
export const GOOGLE = "google";

export class SocialLoginHelperService {
    async getKakaoUid(token: string): Promise<string | undefined> {
        try {
            const result = await axios.get("https://kapi.kakao.com/v1/user/access_token_info", {
                headers: { Authorization: `Bearer ${ token }` },
                responseType: "json",
                validateStatus: (status) => {
                    return (status >= 200 && status < 300) || status === 401;
                }
            });

            if(result.status === 401) {
                throw new VerifyFailed("Invalid token");
            }

            return result.data?.id.toString();
        } catch(error: any) {
            if(error instanceof ServiceException) {
                throw error;
            }
            throw new ServerError(`Kakao API Error: ${ error.message }`);
        }
    }

    async getNaverUid(token: string): Promise<string | undefined> {
        try {
            const result = await axios.get("https://openapi.naver.com/v1/nid/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/xml"
                },
                responseType: "json",
                validateStatus: (status) => {
                    return (status >= 200 && status < 300) || status === 401 || status === 404;
                }
            });

            if(result.status === 401 || result.status === 404) {
                throw new VerifyFailed("Invalid token");
            }

            return result.data?.response?.id;
        } catch(error: any) {
            if(error instanceof ServiceException) {
                throw error;
            }
            throw new ServerError(`Naver API Error: ${ error.message }`);
        }
    }

    async getGoogleUid(token: string): Promise<string | undefined> {
        try {
            const result = await axios.get(`https://oauth2.googleapis.com/tokeninfo?access_token=${ token }`, {
                responseType: "json"
            });

            if(result.status === 401 || result.status === 404 || result.status === 400) {
                throw new VerifyFailed("Invalid token");
            }

            return result.data?.sub;
        } catch(error: any) {
            if(error instanceof ServiceException) {
                throw error;
            }
            throw new ServerError(`Google API Error: ${ error.message }`);
        }
    }
}