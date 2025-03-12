import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment } from "./entity/comment.entity";
import { EntityNotFound } from "../../common/errors/entity-not-found.error";
import { ProcessFailed } from "../../common/errors/process-failed.error";
import { DateHelperService } from "../../common/helpers/date-helper.service";
import { ICommentService } from "./interface/comment-service.interface";
import { UserInfo } from "../../common/types/user-info.type";
import { CommentDto } from "./dto/responses/comment.dto";
import { UpdateCommentDto } from "./dto/requests/update-comment.dto";
import { ContentDto } from "../../common/dto/request/content.dto";

@Injectable()
export class CommentService implements ICommentService {
    constructor(
        @InjectRepository(Comment)
        private readonly repository: Repository<Comment>,
        private readonly dateHelperService: DateHelperService
    ) {}

    // 해당하는 posdId의 게시물의 댓글들을 모두 불러옵니다. 성능 이슈가 발생할 시 게시물들처럼 페이징 처리를 할 수 있습니다.
    async getComments(postId: number): Promise<CommentDto[]> {
        const comments = await this.repository
            .createQueryBuilder("comment")
            .select(["comment.id", "comment.content", "comment.createAt"])
            .leftJoin("comment.user", "user", "user.disableAt IS NULL")
            .addSelect(["user.id", "user.name"])
            .where("comment.postId = :postId", { postId: postId })
            .getMany();
        if(!comments || comments.length === 0) {
            throw new EntityNotFound("Comment not found");
        }

        const results = comments.map(comment => {
            const kst = this.dateHelperService.toKst(comment.createAt);
            const userInfo: UserInfo = { id: comment.user?.id ?? 0, name: comment.user?.name ?? "탈퇴한 사용자" };

            const dto = new CommentDto(comment.id, comment.content, kst, userInfo);
            return dto;
        });
        return results;
    }

    async createComment(postId: number, userId: number, content: ContentDto): Promise<void> {
        const exist = await this.repository.exists({
            where: { postId: postId, userId: userId }
        });
        if(exist) {
            throw new ProcessFailed("Comment already exists");
        }

        await this.repository
            .createQueryBuilder()
            .insert()
            .into(Comment, ["content", "postId", "userId"])
            .values({
                content: content.content,
                postId: postId,
                userId: userId
            })
            .execute();
    }

    async updateComment(commentId: number, userId: number, content: UpdateCommentDto): Promise<void> {
        const exist = await this.repository.exists({
            where: { id: commentId, userId: userId }
        });
        if(!exist) {
            throw new EntityNotFound("Comment not found");
        }

        await this.repository
            .createQueryBuilder()
            .update()
            .set({
                content: content.content
            })
            .execute();
    }

    async deleteComment(commentId: number, userId: number): Promise<void> {
        const exist = await this.repository.exists({
            where: { id: commentId, userId: userId }
        });
        if(!exist) {
            throw new EntityNotFound("Comment not found");
        }

        await this.repository.delete({ id: commentId });
    }
}