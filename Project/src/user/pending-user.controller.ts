import {
    Controller,
    Inject,
    UseGuards,
    UsePipes,
    ValidationPipe,
    Get,
    Post,
    Body,
    Param,
    BadRequestException,
    UnauthorizedException,
    ConflictException
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiSecurity, ApiParam, ApiBody } from "@nestjs/swagger";
import { SwaggerErrorSecurityResponse } from "../common/decorator/swagger-error-security-response.decorator";
import { SwaggerErrorResponse } from "../common/decorator/swagger-error-response.decorator";

import { UserDto } from "./dto/responses/user.dto";
import { RequestFailedDto } from "../common/dto/responses/request-failed.dto";

import { AccessTokenGuard } from "../common/guards/access-token.guard";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { RequestSuccessDto } from "../common/dto/responses/request-success.dto";
import { CreateUserDto } from "./dto/requests/create-user.dto";
import { UserInfo } from "../common/types/user-info.type";
import { PENDING_USER_SERVICE, IPendingUserService } from "./interface/pending-user-service.interface";
import { USER_SERVICE, IUserService } from "./interface/user-service.interface";
import { UserCommonService } from "../common/service/user-common.service";
import { FcmHelperService } from "../common/helpers/fcm-helper.service";

@Controller("pending-users")
export class PendingUserController {
    constructor(
        @Inject(PENDING_USER_SERVICE)
        private readonly pendingUserService: IPendingUserService,
        @Inject(USER_SERVICE)
        private readonly userService: IUserService,
        private readonly userCommonService: UserCommonService,
        private readonly fcmHelperService: FcmHelperService
    ) {}

    @UseGuards(AccessTokenGuard)
    @Get()
    @ApiOperation({ summary: "승인 대기중인 유저 목록을 가져옵니다. 이는 관리자만 조회 가능합니다." })
    @ApiSecurity("access-token")
    @ApiResponse({ status: 200, description: "승인 대기중인 유저 목록", type: [UserDto] })
    @SwaggerErrorSecurityResponse()
    async getUsers(@CurrentUser() user: UserInfo) {
        const isAdmin = await this.userCommonService.checkIsUserAdmin(user.id);
        if(!isAdmin) {
            throw new UnauthorizedException("Permission denied");
        }

        const results = await this.pendingUserService.getUsers();
        return results;
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post()
    @ApiOperation({ summary: "유저를 승인 대기 상태로 생성합니다. 회원가입 용도로 사용할 수 있습니다. 생성 완료 후 fcm 알림을 통해 관리자에게 알림이 갑니다." })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: "유저 생성 성공", type: RequestSuccessDto })
    @ApiResponse({ status: 409, description: "유저의 핸드폰 번호가 이미 DB에 존재함", type: RequestFailedDto })
    @SwaggerErrorResponse()
    async createUser(@Body() body: CreateUserDto) {
        const isDisabledUser = await this.userCommonService.checkIsDisabledUser(body.uid, body.provider);
        if(isDisabledUser) {
            await this.pendingUserService.createUser(body);

            const fcmToken = await this.userCommonService.getUserFcmToken(1);
            if(fcmToken) {
                await this.fcmHelperService.send(fcmToken, "새 유저 알림", "새로운 유저가 승인을 기다리고 있습니다.", "new_user");
            }
            return new RequestSuccessDto();
        }

        const uidExists = await this.userCommonService.checkUserUidExists(body.uid, body.provider);
        if(uidExists) {
            throw new BadRequestException("User uid already exists");
        }

        const phoneExists = await this.userCommonService.checkUserPhoneExists(body.phone);
        if(phoneExists) {
            throw new ConflictException("User phone already exists");
        }

        await this.pendingUserService.createUser(body);

        const fcmToken = await this.userCommonService.getUserFcmToken(1);
        if(fcmToken) {
            await this.fcmHelperService.send(fcmToken, "새 유저 알림", "새로운 유저가 승인을 기다리고 있습니다.", "new_user");
        }

        return new RequestSuccessDto();
    }

    @UseGuards(AccessTokenGuard)
    @Post("move/:id")
    @ApiOperation({ summary: "유저를 승인합니다. 이는 관리자만 가능하며, 대기중인 유저 목록에서 삭제 후 실제 유저 테이블로 이동됩니다." })
    @ApiParam({ name: "id", type: Number, example: 2, description: "승인하려는 유저의 id" })
    @ApiResponse({ status: 201, description: "유저 승인 성공", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async moveUser(@Param("id") id: number, @CurrentUser() user: UserInfo) {
        const isAdmin = await this.userCommonService.checkIsUserAdmin(user.id);
        if(!isAdmin) {
            throw new UnauthorizedException("Permission denied");
        }

        const result = await this.pendingUserService.deleteAndReturnUser(id);
        await this.userService.createUser(result.user, result.queryRunner);

        return new RequestSuccessDto();
    }
}