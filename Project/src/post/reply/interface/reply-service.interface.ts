import { ReplyDto } from "../dto/responses/reply.dto";
import { UpdateReplyDto } from "../dto/requests/update-reply.dto";
import { ContentDto } from "../../../common/dto/request/content.dto";

export const REPLY_SERVICE = "ReplyService";

export interface IReplyService {
    getReplies(commentId: number): Promise<ReplyDto[]>;
    createReply(userId: number, commentId: number, content: ContentDto): Promise<void>;
    updateReply(replyId: number, userId: number, content: UpdateReplyDto): Promise<void>;
    deleteReply(replyId: number, userId: number): Promise<void>;
}