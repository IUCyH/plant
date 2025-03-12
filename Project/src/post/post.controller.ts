import fs from "fs";
import {
    Controller,
    Inject,
    UseGuards,
    UsePipes,
    UseInterceptors,
    ValidationPipe,
    Res,
    Body,
    Param,
    Query,
    UploadedFiles,
    Get,
    Post,
    Patch,
    Delete,
    BadRequestException,
    InternalServerErrorException,
    ForbiddenException
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { Response } from "express";
import { ApiOperation, ApiResponse, ApiSecurity, ApiConsumes, ApiParam, ApiBody, ApiQuery } from "@nestjs/swagger";
import { SwaggerErrorSecurityResponse } from "../common/decorator/swagger-error-security-response.decorator";

import { RequestFailedDto } from "../common/dto/responses/request-failed.dto";
import { PostDto } from "./dto/responses/post.dto";
import { CommentDto } from "./comment/dto/responses/comment.dto";

import { AccessTokenGuard } from "../common/guards/access-token.guard";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { UserInfo } from "../common/types/user-info.type";
import { RequestSuccessDto } from "../common/dto/responses/request-success.dto";
import { CreatePostDto } from "./dto/requests/create-post.dto";
import { UpdatePostDto } from "./dto/requests/update-post.dto";
import { UpdateCommentDto } from "./comment/dto/requests/update-comment.dto";
import { ContentDto } from "../common/dto/request/content.dto";
import { POST_SERVICE, IPostService } from "./interface/post-service.interface";
import { COMMENT_SERVICE, ICommentService } from "./comment/interface/comment-service.interface";
import { UserCommonService } from "../common/service/user-common.service";
import { FcmHelperService } from "../common/helpers/fcm-helper.service";

@Controller("posts")
@ApiSecurity("access-token")
export class PostController {
    constructor(
        @Inject(POST_SERVICE)
        private readonly postService: IPostService,
        private readonly userService: UserCommonService,
        @Inject(COMMENT_SERVICE)
        private readonly commentService: ICommentService,
        private readonly fcmHelperService: FcmHelperService
    ) {}

    @UseGuards(AccessTokenGuard)
    @Get()
    @ApiOperation({ summary: "date 쿼리 파라미터에 입력한 날짜 이전에 작성된 게시물들을 가져옵니다." })
    @ApiQuery({ name: "date", type: String, example: "0", description: "마지막으로 가져온 게시물의 작성 날짜, 만약 처음 가져오는 상황이라면 0을 입력하시면 됩니다." })
    @ApiResponse({ status: 200, description: "가져올 게시물이 존재함", type: [PostDto] })
    @ApiResponse({ status: 404, description: "가져올 게시물이 존재하지 않음", type: RequestFailedDto })
    @SwaggerErrorSecurityResponse()
    async getPosts(@Query("date") date: string) {
        if(date === "0") {
            date = "9999-12-31 23:59:59";
        } else {
            date = new Date(date).toISOString(); // 날짜를 KST에서 UTC로 변환
        }

        const posts = await this.postService.getPosts(date);
        return posts;
    }

    @UseGuards(AccessTokenGuard)
    @Get("private/admin")
    @ApiOperation({ summary: "승인 대기중인 게시물들을 가져옵니다. 이는 관리자만 조회 가능합니다." })
    @ApiResponse({ status: 200, description: "승인 대기중인 게시물이 존재함", type: [PostDto] })
    @ApiResponse({ status: 403, description: "관리자가 아님", type: RequestFailedDto })
    @SwaggerErrorSecurityResponse()
    async getPendingPosts(@CurrentUser() user: UserInfo) {
        const isAdmin = await this.userService.checkIsUserAdmin(user.id);
        if(!isAdmin) {
            throw new ForbiddenException("Permission denied");
        }

        const posts = await this.postService.getPendingPosts();
        return posts;
    }

    @UseGuards(AccessTokenGuard)
    @Get(":id/photos/:order")
    @ApiOperation({ summary: "해당하는 id의 게시물의 특정 순서의 사진을 가져옵니다." })
    @ApiParam({ name: "id", type: Number, example: 1, description: "게시물의 id" })
    @ApiParam({ name: "order", type: Number, example: 1, description: "사진의 순서(id)" })
    @ApiConsumes("multipart/form-data")
    @ApiResponse({ status: 200, description: "해당하는 사진이 존재함", content: { "image/jpeg": { schema: { type: "string", format: "binary" } } } })
    @ApiResponse({ status: 404, description: "해당하는 사진이 존재하지 않음", type: RequestFailedDto })
    @SwaggerErrorSecurityResponse()
    async getPostPhoto(@Res() res: Response, @Param("id") id: number, @Param("order") order: number) {
        const path = await this.postService.getPostPhotoPath(id, order);
        res.sendFile(path);
    }

    @UseGuards(AccessTokenGuard)
    @Get(":id/photos")
    @ApiOperation({ summary: "해당하는 id의 게시물의 사진들을 불러올 수 있는 url들을 가져옵니다." })
    @ApiParam({ name: "id", type: Number, example: 1, description: "게시물의 id" })
    @ApiResponse({ status: 200, description: "해당 게시물에서 불러올 수 있는 사진이 존재함(만약 기존 게시물에서 사진이 있었지만 수정하면서 전부 삭제했다면 배열이 비어있을 수도 있습니다. 한번이라도 해당 게시물에 사진을 등록한 적이 있다면 200이 반환됩니다.)", example: ["/posts/1/photos/1", "/posts/1/photos/2", "/posts/1/photos/3"] })
    @ApiResponse({ status: 404, description: "해당 게시물에서 불러올 수 있는 사진이 존재하지 않음(처음 게시물을 등록할 때 사진을 추가하지 않았고, 이후에도 수정하면서 추가하지 않았다면 404가 반환됩니다.)", type: RequestFailedDto })
    @SwaggerErrorSecurityResponse()
    async getPostPhotoUrls(@Param("id") id: number) {
        const urls = await this.postService.getPostPhotoUrls(id);
        return urls;
    }

    @UseGuards(AccessTokenGuard)
    @Get(":id/comments")
    @ApiOperation({ summary: "해당하는 id의 게시물의 댓글 목록을 가져옵니다." })
    @ApiParam({ name: "id", type: Number, example: 1, description: "게시물의 id" })
    @ApiResponse({ status: 200, description: "해당하는 게시물에 댓글이 존재함", type: [CommentDto] })
    @ApiResponse({ status: 404, description: "해당하는 게시물에 댓글이 존재하지 않음", type: RequestFailedDto })
    @SwaggerErrorSecurityResponse()
    async getComments(@Param("id") id: number) {
        const comments = await this.commentService.getComments(id);
        return comments;
    }

    @UseGuards(AccessTokenGuard)
    @UseInterceptors(
        FilesInterceptor("photo", 20, {
            storage: diskStorage({
                destination: (req, file, callback) => {
                    const { id } = req.params;
                    const uploadPath = process.cwd() + `/uploads/posts/${id}`;

                    if(!req.uploadStarted) {
                        if(!fs.existsSync(uploadPath)) {
                            fs.mkdirSync(uploadPath, { recursive: true });
                        } else {
                            const files = fs.readdirSync(uploadPath);
                            files.forEach(file => {
                                fs.unlinkSync(uploadPath + `/${ file }`);
                            });
                        }

                        req.uploadStarted = true;
                    }

                    callback(null, uploadPath);
                },
                filename: (req, file, callback) => {
                    callback(null, file.originalname);
                }
            }),
            limits: { fileSize: 5 * 1024 * 1024 }
        })
    )
    @Post(":id/photos")
    @ApiOperation({ summary: "해당하는 id의 게시물에 사진들을 업로드 합니다. 처음 게시물을 등록할 때, 이후 수정할 때, 삭제할 때 의 모든 상황에서 사용할 수 있습니다. 해당 게시물에 등록되어 있는 기존 사진들을 전부 삭제한 후 클라이언트에서 보낸 사진들을 일괄 저장 합니다." })
    @ApiParam({ name: "id", type: Number, example: 1, description: "게시물의 id" })
    @ApiResponse({ status: 201, description: "사진 업로드 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    uploadPostPhotos(@Param("id") id: number, @UploadedFiles() files: Express.Multer.File[]) {
        if(!files) {
            throw new InternalServerErrorException("File doesn't uploaded");
        }
        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post()
    @ApiOperation({ summary: "게시물을 승인 대기 상태로 등록합니다. 등록 후 fcm 알림으로 관리자에게 알림이 갑니다." })
    @ApiBody({ type: CreatePostDto })
    @ApiResponse({ status: 201, description: "게시물 등록 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async createPost(@Body() body: CreatePostDto, @CurrentUser() user: UserInfo) {
        const exists = await this.userService.checkUserExists(user.id);
        if(!exists) {
            throw new BadRequestException("User doesn't exists");
        }

        const userName = await this.userService.getUserName(user.id);
        await this.postService.createPost(user.id, userName, body);

        const fcmToken = await this.userService.getUserFcmToken(1);
        if(fcmToken) {
            await this.fcmHelperService.send(fcmToken, "게시물 등록 알림", "새 게시물이 등록되었습니다!", "new_post");
        }

        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @Post(":id/private/admin")
    @ApiOperation({ summary: "대기중인 게시물을 승인합니다. 이는 관리자만 가능합니다." })
    @ApiParam({ name: "id", type: Number, example: 1, description: "대기중인 게시물의 id" })
    @ApiResponse({ status: 201, description: "게시물 승인 성공", type: RequestSuccessDto })
    @ApiResponse({ status: 403, description: "관리자가 아님", type: RequestFailedDto })
    @SwaggerErrorSecurityResponse()
    async realCreatePost(@Param("id") id: number, @CurrentUser() user: UserInfo) {
        const isAdmin = await this.userService.checkIsUserAdmin(user.id);
        if(!isAdmin) {
            throw new ForbiddenException("Permission denied");
        }

        await this.postService.realCreatePost(id);
        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @Post(":id/comments")
    @ApiOperation({ summary: "해당하는 id의 게시물에 댓글을 등록합니다." })
    @ApiBody({ type: ContentDto })
    @ApiParam({ name: "id", type: Number, example: 1, description: "게시물의 id" })
    @ApiResponse({ status: 201, description: "댓글 등록 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async createComment(@Body() body: ContentDto, @Param("id") id: number, @CurrentUser() user: UserInfo) {
        const exists = await this.userService.checkUserExists(user.id);
        if(!exists) {
            throw new BadRequestException("User doesn't exists");
        }

        await this.commentService.createComment(id, user.id, body);
        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @Patch(":id")
    @ApiOperation({ summary: "해당하는 id의 게시물을 업데이트 합니다. 자신이 작성한 게시물만 가능합니다." })
    @ApiParam({ name: "id", type: Number, example: 1, description: "게시물의 id" })
    @ApiBody({ type: UpdatePostDto })
    @ApiResponse({ status: 200, description: "게시물 업데이트 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async updatePost(@Param("id") id: number, @Body()body: UpdatePostDto, @CurrentUser() user: UserInfo) {
        await this.postService.updatePost(id, user.id, body);
        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @Patch(":id/comments/:commentId")
    @ApiOperation({ summary: "해당하는 commentId의 댓글을 업데이트 합니다. 자신이 작성한 댓글만 가능합니다." })
    @ApiBody({ type: UpdateCommentDto })
    @ApiParam({ name: "id", type: Number, example: 1, description: "게시물의 id" })
    @ApiParam({ name: "commentId", type: Number, example: 1, description: "댓글의 id" })
    @ApiResponse({ status: 200, description: "댓글 수정 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async updateComment(@Body() body: UpdateCommentDto, @Param("id") id: number, @Param("commentId") commentId: number, @CurrentUser() user: UserInfo) {
        await this.commentService.updateComment(commentId, user.id, body);
        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @Delete(":id")
    @ApiOperation({ summary: "해당하는 id의 게시물을 삭제합니다. 자신이 작성한 게시물만 가능합니다." })
    @ApiParam({ name: "id", type: Number, example: 1, description: "게시물의 id" })
    @ApiResponse({ status: 200, description: "게시물 삭제 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async deletePost(@Param("id") id: number, @CurrentUser() user: UserInfo) {
        await this.postService.deletePost(id, user.id);
        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @Delete(":id/comments/:commentId")
    @ApiOperation({ summary: "해당하는 commentId의 댓글을 삭제합니다. 자신이 작성한 댓글만 가능합니다." })
    @ApiParam({ name: "id", type: Number, example: 1, description: "게시물의 id" })
    @ApiParam({ name: "commentId", type: Number, example: 1, description: "댓글의 id" })
    @ApiResponse({ status: 200, description: "댓글 삭제 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async deleteComment(@Param("id") id: number, @Param("commentId") commentId: number, @CurrentUser() user: UserInfo) {
        await this.commentService.deleteComment(commentId, user.id);
    }
}