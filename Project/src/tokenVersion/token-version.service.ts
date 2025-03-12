import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TOKEN_TYPE } from "../common/helpers/token-helper.service";
import { TokenVersion } from "./entity/token-version.entity";

@Injectable()
export class TokenVersionService {
    constructor(
        @InjectRepository(TokenVersion)
        private readonly repository: Repository<TokenVersion>
    ) {}

    async getVersion<T extends keyof typeof TOKEN_TYPE>(type: (typeof TOKEN_TYPE)[T], userId: number): Promise<string | null> {
        const tokenVersion = await this.repository.findOne({
            where: { type: type, userId: userId },
            select: ["version"]
        });

        if(!tokenVersion) {
            return null;
        }
        return tokenVersion.version;
    }

    // 토큰의 버전을 업데이트 합니다. 만약 해당하는 데이터가 이미 존재한다면 업데이트(OrUpdate) 합니다.
    async upsertVersion(type: (typeof TOKEN_TYPE)["REFRESH" | "ACCESS"], version: string, userId: number): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .insert()
            .into(TokenVersion, ["type", "version", "userId"])
            .values({
                type: type,
                version: version,
                userId: userId
            })
            .orUpdate(["version"], ["userId", "type"])
            .execute();
    }
}