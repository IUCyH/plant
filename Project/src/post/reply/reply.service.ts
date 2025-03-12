import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Reply } from "./entity/reply.entity";
import { EntityNotFound } from "../../common/errors/entity-not-found.error";
import { ProcessFailed } from "../../common/errors/process-failed.error";
import { DateHelperService } from "../../common/helpers/date-helper.service";
import { IReplyService } from "./interface/reply-service.interface";
import { ReplyDto } from "./dto/responses/reply.dto";
import { UpdateReplyDto } from "./dto/requests/update-reply.dto";
import { ContentDto } from "../../common/dto/request/content.dto";

@Injectable()
export class ReplyService implements IReplyService {
    constructor(
        @InjectRepository(Reply)
        private readonly repository: Repository<Reply>,
        private readonly dateHelperService: DateHelperService
    ) {}

    // 해당하는 commentId의 댓글의 답글들을 모두 조회합니다.
    async getReplies(commentId: number): Promise<ReplyDto[]> {
        const replies = await this.repository
            .createQueryBuilder("reply")
            .select(["reply.id", "reply.content", "reply.createAt"])
            .leftJoin("reply.user", "user", "user.disableAt IS NULL")
            .addSelect(["user.id", "user.name"])
            .where("reply.commentId = :commentId", { commentId: commentId})
            .getMany();
        if(!replies || replies.length === 0) {
            throw new EntityNotFound("Reply not found");
        }

        const results = replies.map(reply => {
            const kst = this.dateHelperService.toKst(reply.createAt);
            const userInfo = { id: reply.user?.id ?? 0, name: reply.user?.name ?? "탈퇴한 사용자" };

            const dto = new ReplyDto(reply.id, reply.content, kst, userInfo);
            return dto;
        });
        return results;
    }

    async createReply(userId: number, commentId: number, content: ContentDto): Promise<void> {
        const exist = await this.repository.exists({
            where: { commentId: commentId, userId: userId }
        });
        if(exist) {
            throw new ProcessFailed("Reply already exists");
        }

        await this.repository
            .createQueryBuilder()
            .insert()
            .into(Reply, ["content", "userId", "commentId"])
            .values({
                content: content.content,
                userId: userId,
                commentId: commentId
            })
            .execute();
    }

    async updateReply(replyId: number, userId: number, content: UpdateReplyDto): Promise<void> {
        const exist = await this.repository.exists({
            where: { id: replyId, userId: userId }
        });
        if(!exist) {
            throw new EntityNotFound("Reply not found");
        }

        await this.repository
            .createQueryBuilder()
            .update()
            .set({
                content: content.content
            })
            .execute();
    }

    async deleteReply(replyId: number, userId: number): Promise<void> {
        const exist = await this.repository.exists({
            where: { id: replyId, userId: userId }
        });
        if(!exist) {
            throw new EntityNotFound("Reply not found");
        }

        await this.repository.delete({ id: replyId });
    }
}