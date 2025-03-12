import {
    Controller,
    Inject,
    UseGuards,
    Param,
    Body,
    Get,
    Post,
    Patch,
    Delete,
    BadRequestException
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiSecurity, ApiParam, ApiBody } from "@nestjs/swagger";
import { SwaggerErrorSecurityResponse } from "../../common/decorator/swagger-error-security-response.decorator";

import { ReplyDto } from "../reply/dto/responses/reply.dto";

import { AccessTokenGuard } from "../../common/guards/access-token.guard";
import { UserInfo } from "../../common/types/user-info.type";
import { CurrentUser } from "../../common/decorator/current-user.decorator";
import { REPLY_SERVICE, IReplyService } from "../reply/interface/reply-service.interface";
import { UserCommonService } from "../../common/service/user-common.service";
import { ContentDto } from "../../common/dto/request/content.dto";
import { UpdateReplyDto } from "../reply/dto/requests/update-reply.dto";
import { RequestSuccessDto } from "../../common/dto/responses/request-success.dto";

@Controller("comments")
@ApiSecurity("access-token")
export class CommentController {
    constructor(
        @Inject(REPLY_SERVICE)
        private readonly replyService: IReplyService,
        private readonly userService: UserCommonService,
    ) {}

    @UseGuards(AccessTokenGuard)
    @Get(":id/replies")
    @ApiOperation({ summary: "해당하는 id의 댓글의 답글 목록을 가져옵니다." })
    @ApiParam({ name: "id", type: Number, example: 1, description: "댓글의 id" })
    @ApiResponse({ status: 200, description: "해당하는 댓글의 답글이 존재함", type: [ReplyDto] })
    @SwaggerErrorSecurityResponse()
    async getReplies(@Param("id") id: number) {
        const replies = await this.replyService.getReplies(id);
        return replies;
    }

    @UseGuards(AccessTokenGuard)
    @Post(":id/replies")
    @ApiOperation({ summary: "해당하는 id의 댓글에 답글을 추가합니다." })
    @ApiBody({ type: ContentDto })
    @ApiParam({ name: "id", type: Number, example: 1, description: "댓글의 id" })
    @ApiResponse({ status: 201, description: "답글 추가 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async createReply(@Body() body: ContentDto, @Param("id") id: number, @CurrentUser() user: UserInfo) {
        const exist = await this.userService.checkUserExists(user.id);
        if(!exist) {
            throw new BadRequestException("User doesn't exists");
        }

        await this.replyService.createReply(user.id, id, body);
        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @Patch(":id/replies/:replyId")
    @ApiOperation({ summary: "해당하는 replyId의 답글을 수정합니다. 자신이 작성한 답글만 가능합니다." })
    @ApiBody({ type: UpdateReplyDto })
    @ApiParam({ name: "id", type: Number, example: 1, description: "댓글의 id" })
    @ApiParam({ name: "replyId", type: Number, example: 1, description: "답글의 id" })
    @ApiResponse({ status: 200, description: "업데이트 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async updateReply(@Body() body: UpdateReplyDto, @Param("id") id: number, @Param("replyId") replyId: number, @CurrentUser() user: UserInfo) {
        await this.replyService.updateReply(replyId, user.id, body);
        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @Delete(":id/replies/:replyId")
    @ApiOperation({ summary: "해당하는 replyId의 답글을 삭제합니다. 자신이 작성한 답글만 가능합니다." })
    @ApiParam({ name: "id", type: Number, example: 1, description: "댓글의 id" })
    @ApiParam({ name: "replyId", type: Number, example: 1, description: "답글의 id" })
    @ApiResponse({ status: 200, description: "답글 삭제 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async deleteReply(@Param("id") id: number, @Param("replyId") replyId: number, @CurrentUser() user: UserInfo) {
        await this.replyService.deleteReply(replyId, user.id);
        return new RequestSuccessDto();
    }
}