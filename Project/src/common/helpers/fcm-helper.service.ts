import { Injectable } from "@nestjs/common";
import admin from "firebase-admin";

export const FCM_TYPE = {
    NEW_POST: "new_post",
    NEW_USER: "new_user"
} as const;

@Injectable()
export class FcmHelperService {
    async send(token: string, title: string, message: string, type: (typeof FCM_TYPE)["NEW_POST" | "NEW_USER"]) {
        const payload: any = {
            token: token,
            notification: {
                title: title,
                body: message
            },
            data: {
                type: type
            }
        };

        await admin.messaging().send(payload);
    }
}