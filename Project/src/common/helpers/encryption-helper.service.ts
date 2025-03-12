import { Injectable } from "@nestjs/common";
import { AES, mode, pad, enc } from "crypto-ts";

@Injectable()
export class EncryptionHelperService {
    private readonly encryptionKey = process.env.ENCRYPTION_KEY ?? "";
    private readonly iv = process.env.ENCRYPTION_IV ?? "";

    encrypt(value: string) {
        const encrypted = AES.encrypt(value, this.encryptionKey, {
            iv: enc.Utf8.parse(this.iv),
            mode: mode.CBC,
            padding: pad.PKCS7
        }).toString();
        return encrypted;
    }

    decrypt(value: string) {
        const decrypted = AES.decrypt(value, this.encryptionKey, {
            iv: enc.Utf8.parse(this.iv),
            mode: mode.CBC,
            padding: pad.PKCS7
        }).toString(enc.Utf8);
        return decrypted;
    }
}