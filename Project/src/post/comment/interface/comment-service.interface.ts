import { CommentDto } from "../dto/responses/comment.dto";
import { UpdateCommentDto } from "../dto/requests/update-comment.dto";
import { ContentDto } from "../../../common/dto/request/content.dto";

export const COMMENT_SERVICE = "CommentService";

export interface ICommentService {
    getComments(postId: number): Promise<CommentDto[]>;
    createComment(postId: number, userId: number, content: ContentDto): Promise<void>;
    updateComment(commentId: number, userId: number, content: UpdateCommentDto): Promise<void>;
    deleteComment(commentId: number, userId: number): Promise<void>;
}