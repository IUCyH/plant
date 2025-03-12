import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Announcement } from "../../announcement/entity/announcement.entity";
import { Post } from "../../post/entity/post.entity";
import { TokenVersion } from "../../tokenVersion/entity/token-version.entity";
import { WorkInfo } from "../../workInfo/entity/work-info.entity";
import { Comment } from "../../post/comment/entity/comment.entity";
import { Reply } from "../../post/reply/entity/reply.entity";

@Injectable()
export class CleanHelperService {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {}

    async cleanUserRelatedData(id: number) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.delete(TokenVersion, { userId: id });
            await queryRunner.manager.delete(WorkInfo, { userId: id });

            await queryRunner.commitTransaction();
            await queryRunner.release();
        } catch(error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            throw error;
        }
    }
}