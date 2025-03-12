import { Injectable } from "@nestjs/common";
import argon2 from "argon2";

@Injectable()
export class HashHelperService {
    private readonly hashOptions = {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        parallelism: 2,
        hashLength: 32,
        secret: process.env.HASH_PEPPER ? Buffer.from(process.env.HASH_PEPPER) : undefined
    };

    async hash(value: string): Promise<string> {
        const result = await argon2.hash(value, this.hashOptions);
        return result;
    }

    async verify(value: string, hash: string): Promise<boolean> {
        const result = await argon2.verify(hash, value, { secret: this.hashOptions.secret });
        return result;
    }
}