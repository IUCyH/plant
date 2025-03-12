import * as fs from "fs";
import {
    Controller,
    Inject,
    UseGuards,
    UsePipes,
    UseInterceptors,
    InternalServerErrorException,
    ForbiddenException,
    ValidationPipe,
    Get,
    Post,
    Patch,
    Delete,
    Res,
    UploadedFiles,
    Body,
    Param,
    Query
} from "@nestjs/common";
import { Response } from "express";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { ApiOperation, ApiResponse, ApiSecurity, ApiConsumes, ApiParam, ApiBody, ApiQuery } from "@nestjs/swagger";
import { SwaggerErrorSecurityResponse } from "../common/decorator/swagger-error-security-response.decorator";

import { AnnouncementDto } from "./dto/responses/announcement.dto";
import { RequestFailedDto } from "../common/dto/responses/request-failed.dto";

import { CurrentUser } from "../common/decorator/current-user.decorator";
import { AccessTokenGuard } from "../common/guards/access-token.guard";
import { UserInfo } from "../common/types/user-info.type";
import { RequestSuccessDto } from "../common/dto/responses/request-success.dto";
import { CreateAnnouncementDto } from "./dto/requests/create-announcement.dto";
import { UpdateAnnouncementDto } from "./dto/requests/update-announcement.dto";
import { IAnnouncementService, ANNOUNCEMENT_SERVICE } from "./interface/announcement-service.interface";
import { UserCommonService } from "../common/service/user-common.service";

@Controller("announcements")
@ApiSecurity("access-token")
export class AnnouncementController {
    constructor(
        @Inject(ANNOUNCEMENT_SERVICE)
        private readonly announcementService: IAnnouncementService,
        private readonly userService: UserCommonService,
    ) {}

    @UseGuards(AccessTokenGuard)
    @Get()
    @ApiOperation({ summary: "date 쿼리 파라미터에 입력된 날짜 이전에 작성된 공지사항들을 가져옵니다." })
    @ApiQuery({ name: "date", type: String, example: "0", description: "마지막으로 가져온 게시물의 작성날짜, 만약 처음 가져오는 상황이라면 0을 입력하시면 됩니다." })
    @ApiResponse({ status: 200, description: "가져올 게시물이 존재함", type: [AnnouncementDto] })
    @ApiResponse({ status: 404, description: "가져올 게시물이 존재하지 않음", type: RequestFailedDto })
    @SwaggerErrorSecurityResponse()
    async getAnnouncements(@Query("date") date: string) {
        if(date === "0") {
            date = "9999-12-31 23:59:59";
        } else {
            date = new Date(date).toISOString(); // 날짜를 KST에서 UTC로 변경
        }

        const results = await this.announcementService.getAnnouncements(date);
        return results;
    }

    @UseGuards(AccessTokenGuard)
    @Get(":id/photos/:order")
    @ApiOperation({ summary: "해당하는 id의 공지사항의 특정 순서의 사진을 가져옵니다." })
    @ApiParam({ name: "id", type: Number, example: 1, description: "게시물의 id" })
    @ApiParam({ name: "order", type: Number, example: 1, description: "사진의 순서(id)" })
    @ApiConsumes("multipart/form-data")
    @ApiResponse({ status: 200, description: "해당하는 사진이 존재함", content: { "image/jpeg": { schema: { type: "string", format: "binary" } } } })
    @ApiResponse({ status: 404, description: "해당하는 사진이 존재하지 않음", type: RequestFailedDto })
    @SwaggerErrorSecurityResponse()
    async getAnnouncementPhoto(@Res() res: Response, @Param("id") id: number, @Param("order") order: number) {
        const path = await this.announcementService.getAnnouncementPhotoPath(id, order);
        res.sendFile(path);
    }

    @UseGuards(AccessTokenGuard)
    @Get(":id/photos")
    @ApiOperation({ summary: "해당하는 id의 공지사항의 사진들을 불러올 수 있는 url들을 가져옵니다." })
    @ApiParam({ name: "id", type: Number, example: 1, description: "게시물의 id" })
    @ApiResponse({ status: 200, description: "해당 게시물에서 불러올 수 있는 사진이 존재함(만약 기존 게시물에서 사진이 있었지만 수정하면서 전부 삭제했다면 배열이 비어있을 수도 있습니다. 한번이라도 해당 게시물에 사진을 등록한 적이 있다면 200이 반환됩니다.)", example: ["/announcements/1/photos/1", "/announcements/1/photos/2", "/announcements/1/photos/3"] })
    @ApiResponse({ status: 404, description: "해당 게시물에서 불러올 수 있는 사진이 존재하지 않음(처음 게시물을 등록할 때 사진을 추가하지 않았고, 이후에도 수정하면서 추가하지 않았다면 404가 반환됩니다.)", type: RequestFailedDto })
    @SwaggerErrorSecurityResponse()
    async getAnnouncementPhotoUrls(@Param("id") id: number) {
        const urls = await this.announcementService.getAnnouncementPhotoUrls(id);
        return urls;
    }

    @UseGuards(AccessTokenGuard)
    @UseInterceptors(
        FilesInterceptor("photo", 20, {
            storage: diskStorage({
                destination: (req, file, callback) => {
                    const { id } = req.params;
                    const uploadPath = process.cwd() + `/uploads/announcements/${id}`;

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
            limits: { fileSize: 5 * 1024 * 1024 } // 5MB
        })
    )
    @Post(":id/photos")
    @ApiOperation({ summary: "해당하는 id의 공지사항에 사진들을 업로드 합니다. 처음 게시물을 등록할 때, 이후 수정할 때, 삭제할 때 의 모든 상황에서 사용할 수 있습니다. 해당 게시물에 등록되어 있는 기존 사진들을 전부 삭제한 후 클라이언트에서 보낸 사진들을 일괄 저장 합니다."})
    @ApiParam({ name: "id", type: Number, example: 1, description: "게시물의 id" })
    @ApiResponse({ status: 201, description: "게시물에 사진 등록 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    uploadAnnouncementPhotos(@Param("id") id: number, @UploadedFiles() files: Express.Multer.File[]) {
        if(!files) {
            throw new InternalServerErrorException("File doesn't uploaded");
        }
        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post()
    @ApiOperation({ summary: "새 공지사항을 등록합니다. 이는 관리자만 가능합니다." })
    @ApiBody({ type: CreateAnnouncementDto })
    @ApiResponse({ status: 201, description: "공지사항 생성 성공", type: RequestSuccessDto })
    @ApiResponse({ status: 403, description: "관리자가 아님", type: RequestFailedDto })
    @SwaggerErrorSecurityResponse()
    async createAnnouncement(@Body() body: CreateAnnouncementDto, @CurrentUser() user: UserInfo) {
        const isAdmin = await this.userService.checkIsUserAdmin(user.id);
        if(!isAdmin) {
            throw new ForbiddenException("Permission denied");
        }

        await this.announcementService.createAnnouncement(body, user.id);
        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @Patch(":id")
    @ApiOperation({ summary: "공지사항을 업데이트 합니다. 자신이 작성한 공지사항만 업데이트 가능합니다." })
    @ApiBody({ type: UpdateAnnouncementDto })
    @ApiParam({ name: "id", type: Number, example: 1, description: "게시물의 id" })
    @ApiResponse({ status: 200, description: "게시물 업데이트 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async updateAnnouncement(@Body() body: UpdateAnnouncementDto, @Param("id") id: number, @CurrentUser() user: UserInfo) {
        await this.announcementService.updateAnnouncement(id, user.id, body);
        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @Delete(":id")
    @ApiOperation({ summary: "공지사항을 삭제합니다. 자신이 작성한 공지사항만 삭제 가능합니다." })
    @ApiParam({ name: "id", type: Number, example: 1, description: "공지사항의 id" })
    @ApiResponse({ status: 200, description: "삭제 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async deleteAnnouncement(@Param("id") id: number, @CurrentUser() user: UserInfo) {
        await this.announcementService.deleteAnnouncement(id, user.id);
        return new RequestSuccessDto();
    }
}