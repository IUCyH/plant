import {
    Controller,
    Inject,
    UseGuards,
    UsePipes,
    UseInterceptors,
    Get,
    Post,
    Patch,
    Delete,
    Res,
    Body,
    Param,
    Query,
    UploadedFile,
    InternalServerErrorException
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { diskStorage } from "multer";
import { ApiExcludeEndpoint, ApiConsumes, ApiOperation, ApiResponse, ApiSecurity, ApiParam, ApiQuery, ApiBody } from "@nestjs/swagger";
import { SwaggerErrorSecurityResponse } from "../common/decorator/swagger-error-security-response.decorator";

import { CurrentUser } from "../common/decorator/current-user.decorator";
import { UpdateBodyValidationPipe } from "../common/pipe/update-body-validation.pipe";
import { AccessTokenGuard } from "../common/guards/access-token.guard";

import { UserDto } from "./dto/responses/user.dto";
import { AnnouncementDto } from "../announcement/dto/responses/announcement.dto";
import { PostDto } from "../post/dto/responses/post.dto";
import { RequestFailedDto } from "../common/dto/responses/request-failed.dto";

import { UserInfo } from "../common/types/user-info.type";
import { RequestSuccessDto } from "../common/dto/responses/request-success.dto";
import { CreateUserDto } from "./dto/requests/create-user.dto";
import { UpdateUserDto } from "./dto/requests/update-user.dto";
import { USER_SERVICE, IUserService } from "./interface/user-service.interface";
import { ANNOUNCEMENT_SERVICE, IAnnouncementService } from "../announcement/interface/announcement-service.interface";
import { POST_SERVICE, IPostService } from "../post/interface/post-service.interface";

@Controller("users")
@ApiSecurity("access-token")
export class UserController {
    constructor(
        @Inject(USER_SERVICE)
        private readonly userService: IUserService,
        @Inject(ANNOUNCEMENT_SERVICE)
        private readonly announcementService: IAnnouncementService,
        @Inject(POST_SERVICE)
        private readonly postService: IPostService,
    ) {}

    @UseGuards(AccessTokenGuard)
    @Get("me")
    @ApiOperation({ summary: "내 유저 정보를 가져옵니다." })
    @ApiResponse({ status: 200, description: "액세스 토큰에서 추출한 id에 해당하는 유저가 존재함", type: UserDto })
    @ApiResponse({ status: 404, description: "해당하는 id의 유저가 존재하지 않음", type: RequestFailedDto })
    @SwaggerErrorSecurityResponse()
    async getMyUser(@CurrentUser() user: UserInfo) {
        const userResult = await this.userService.getUser(user.id);
        return userResult;
    }

    @UseGuards(AccessTokenGuard)
    @Get(":id")
    @ApiOperation({ summary: "해당하는 id의 유저 정보를 가져옵니다." })
    @ApiParam({ name: "id", type: Number, example: 2, description: "유저의 id" })
    @ApiResponse({ status: 200, description: "id에 해당하는 유저가 존재함", type: UserDto })
    @ApiResponse({ status: 404, description: "해당하는 id의 유저가 존재하지 않음", type: RequestFailedDto })
    @SwaggerErrorSecurityResponse()
    async getUser(@Param("id") id: number) {
        const userResult = await this.userService.getUser(id);
        return userResult;
    }

    @UseGuards(AccessTokenGuard)
    @Get("me/announcements")
    @ApiOperation({ summary: "내가 작성한 공지사항 글들을 가져옵니다." })
    @ApiQuery({ name: "date", type: String, example: "0", description: "마지막으로 가져온 게시물의 작성 날짜. 가공되지 않은 서버에서 받은 값 그대로여야 하며, 만약 처음 불러오는 상황이라면 0 을 입력하시면 됩니다." })
    @ApiResponse({ status: 200, description: "가져올 게시물이 존재함", type: [AnnouncementDto] })
    @ApiResponse({ status: 404, description: "가져올 게시물이 존재하지 않음", type: RequestFailedDto })
    @SwaggerErrorSecurityResponse()
    async getMyAnnouncements(@CurrentUser() user: UserInfo, @Query("date") date: string) {
        if(date === "0") {
            date = "9999-12-31 23:59:59";
        } else {
            date = new Date(date).toISOString(); // 날짜를 KST에서 UTC로 변환
        }

        const results = await this.announcementService.getMyAnnouncements(user.id, date);
        return results;
    }

    @UseGuards(AccessTokenGuard)
    @Get("me/posts")
    @ApiOperation({ summary: "내가 작성한 커뮤니티 글들을 가져옵니다." })
    @ApiQuery({ name: "date", type: String, example: "0", description: "마지막으로 가져온 게시물의 작성 날짜. 가공되지 않은 서버에서 받은 값 그대로여야 하며, 만약 처음 불러오는 상황이라면 0 을 입력하시면 됩니다." })
    @ApiResponse({ status: 200, description: "가져올 게시물이 존재함", type: [PostDto] })
    @ApiResponse({ status: 404, description: "가져올 게시물이 존재하지 않음", type: RequestFailedDto })
    @SwaggerErrorSecurityResponse()
    async getMyPosts(@CurrentUser() user: UserInfo, @Query("date") date: string) {
        if(date === "0") {
            date = "9999-12-31 23:59:59";
        } else {
            date = new Date(date).toISOString(); // 날짜를 KST에서 UTC로 변환
        }

        const results = await this.postService.getMyPosts(user.id, date);
        return results;
    }

    @UseGuards(AccessTokenGuard)
    @Get(":id/profile-image")
    @ApiOperation({ summary: "해당하는 id의 프로필 이미지를 가져옵니다. 내 프로필 이미지도 이 api로 가져올 수 있습니다."} )
    @ApiConsumes("multipart/form-data")
    @ApiParam({ name: "id", type: Number, example: 2, description: "프로필을 가져오려는 유저의 id"})
    @ApiResponse({ status: 200, description: "해당하는 id의 프로필 이미지가 존재함", content: { "image/jpeg": { schema: { type: "string", format: "binary" } } } } )
    @ApiResponse({ status: 404, description: "해당하는 id의 프로필 이미지가 존재하지 않음", type: RequestFailedDto } )
    @SwaggerErrorSecurityResponse()
    async getProfileImage(@Param("id") id: number, @Res() res: Response) {
        const path = await this.userService.getProfileImagePath(id);
        res.sendFile(path);
    }

    @UseGuards(AccessTokenGuard)
    @UseInterceptors(
        FileInterceptor("profile_image", {
            storage: diskStorage({
                destination: (req, file, callback) => {
                    const uploadPath = process.cwd() + "/uploads/profiles";
                    callback(null, uploadPath);
                },
                filename: (req, file, callback) => {
                    const user = req.user;
                    const newFileName = `${ user!.id }-profile.jpg`;
                    callback(null, newFileName);
                }
            }),
            limits: { fileSize: 5 * 1024 * 1024 }
        })
    )
    @Post("me/profile-image")
    @ApiOperation({ summary: "프로필 사진을 업로드 합니다. 기존 사진을 변경하거나, 새로 추가하는 상황 모두에 사용할 수 있습니다."})
    @ApiResponse({ status: 201, description: "사진 업로드 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    uploadProfile(@UploadedFile() file: Express.Multer.File) {
        if(!file) {
            throw new InternalServerErrorException("File doesn't upload");
        }
        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @UsePipes(new UpdateBodyValidationPipe())
    @Patch("me")
    @ApiOperation({ summary: "내 유저 정보를 업데이트 합니다. body의 각 파라미터는 필요에 따라 추가하거나 제외할 수 있습니다. 예) { uid, name } or { uid }, { name } 모두 가능" })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, description: "업데이트 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async updateUser(@CurrentUser() user: UserInfo, @Body() body: UpdateUserDto) {
        await this.userService.updateUser(user.id, body);
        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @Delete("me")
    @ApiOperation({ summary: "내 유저 정보를 삭제합니다. 이는 완전 삭제(hard delete)가 아닌 비활성화(soft delete) 처리입니다." })
    @ApiResponse({ status: 200, description: "삭제 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async disableUser(@CurrentUser() user: UserInfo) {
        await this.userService.disableUser(user.id);
        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @Delete("me/profile-image")
    @ApiOperation({ summary: "내 프로필 사진을 삭제합니다. 기본 프로필 사진으로 변경 시 사용할 수 있습니다. 변경 후 유저의 hasProfileImage 속성도 false로 변경됩니다." })
    @ApiResponse({ status: 200, description: "프로필 사진 삭제 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async deleteProfileImage(@CurrentUser() user: UserInfo) {
        await this.userService.deleteProfileImage(user.id);
        return new RequestSuccessDto();
    }
}