import {
    Controller,
    Inject,
    UseGuards,
    UsePipes,
    ValidationPipe,
    Body,
    Post,
    Delete,
    BadRequestException,
    UnauthorizedException,
    NotFoundException,
    HttpException
} from "@nestjs/common";
import { ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiSecurity, ApiBody } from "@nestjs/swagger";
import { SwaggerErrorSecurityResponse } from "../common/decorator/swagger-error-security-response.decorator";

import { RequestFailedDto } from "../common/dto/responses/request-failed.dto";

import { EntityNotFound } from "../common/errors/entity-not-found.error";
import { CurrentUser } from "../common/decorator/current-user.decorator";
import { Token } from "../common/decorator/token.decorator";
import { UserInfo } from "../common/types/user-info.type";
import { AccessTokenGuard } from "../common/guards/access-token.guard";
import { RefreshTokenGuard } from "../common/guards/refresh-token.guard";

import { AccessTokenDto } from "./dto/responses/access-token.dto";
import { TokenPairDto } from "./dto/responses/token-pair.dto";
import { RequestSuccessDto } from "../common/dto/responses/request-success.dto";
import { LoginDto } from "./dto/requests/login.dto";
import { SocialLoginDto } from "./dto/requests/social-login.dto";

import { IAuthService, AUTH_SERVICE } from "./interface/auth-service.interface";
import { UserCommonService } from "../common/service/user-common.service";
import { SocialLoginHelperService, KAKAO, NAVER, GOOGLE } from "../common/helpers/social-login-helper.service";

@Controller("auth")
export class AuthController {
    constructor(
        @Inject(AUTH_SERVICE)
        private readonly authService: IAuthService,
        private readonly userService: UserCommonService,
        private readonly socialLoginHelper: SocialLoginHelperService,
    ) {}

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post("login/kakao")
    @ApiOperation({ summary: "카카오 로그인을 위한 api. 앱에서 sdk를 통해 액세스 토큰을 발급받은 후 해당 토큰을 헤더(Bearer)로 전달해주시면 됩니다." })
    @ApiSecurity("access-token")
    @ApiBody({ type: SocialLoginDto })
    @ApiResponse({ status: 201, description: "카카오 로그인 성공, 이후 리프레시 토큰의 기간(한달) 동안은 재로그인 없이 액세스 토큰을 이용하시면 됩니다.", type: TokenPairDto })
    @ApiResponse({ status: 202, description: "해당 유저가 승인 대기중인 상태입니다.", type: RequestFailedDto })
    @ApiResponse({ status: 404, description: "유저가 DB에 존재하지 않습니다.(새 유저), 반환되는 uid를 이용해 회원가입을 진행해 주시면 됩니다.", example: { statusCode: 404, message: "Error processing request", response: { uid: "123456789" } } })
    @SwaggerErrorSecurityResponse()
    async kakaoLogin(@Body() body: SocialLoginDto, @Token() token: string | undefined) {
        if(!token) {
            throw new BadRequestException("Token not found");
        }

        const uid = await this.socialLoginHelper.getKakaoUid(token);
        if(!uid) {
            throw new UnauthorizedException("Invalid token");
        }

        const isInPending = await this.userService.checkUserInPending(uid, KAKAO);
        if(isInPending) {
            throw new HttpException("User is in pending", 202);
        }

        let id;
        try {
            id = await this.userService.getUserIdByUidAndProvider(uid, KAKAO);
        } catch(error) {
            if(error instanceof EntityNotFound) {
                throw new NotFoundException({ uid: uid });
            }
            throw error;
        }

        await this.userService.updateFcmToken(id, body.fcmToken);

        const accessToken = await this.authService.getAccessToken(id, "15m");
        const refreshToken = await this.authService.getRefreshToken(id);
        return new TokenPairDto(accessToken, refreshToken);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post("login/naver")
    @ApiOperation({ summary: "네이버 로그인을 위한 api. 앱에서 sdk를 통해 액세스 토큰을 발급받은 후 해당 토큰을 헤더(Bearer)로 전달해주시면 됩니다." })
    @ApiSecurity("access-token")
    @ApiBody({ type: SocialLoginDto })
    @ApiResponse({ status: 201, description: "네이버 로그인 성공, 이후 리프레시 토큰의 기간(한달) 동안은 재로그인 없이 액세스 토큰을 이용하시면 됩니다.", type: TokenPairDto })
    @ApiResponse({ status: 202, description: "해당 유저가 승인 대기중인 상태입니다.", type: RequestFailedDto })
    @ApiResponse({ status: 404, description: "유저가 DB에 존재하지 않습니다.(새 유저), 반환되는 uid를 이용해 회원가입을 진행해 주시면 됩니다.", example: { statusCode: 404, message: "Error processing request", response: { uid: "123456789" } } })
    @SwaggerErrorSecurityResponse()
    async naverLogin(@Body() body: SocialLoginDto, @Token() token: string | undefined) {
        if(!token) {
            throw new BadRequestException("Token not found");
        }

        const uid = await this.socialLoginHelper.getNaverUid(token);
        if(!uid) {
            throw new UnauthorizedException("Invalid token");
        }

        const isInPending = await this.userService.checkUserInPending(uid, NAVER);
        if(isInPending) {
            throw new HttpException("User is in pending", 202);
        }

        let id;
        try {
            id = await this.userService.getUserIdByUidAndProvider(uid, NAVER);
        } catch(error) {
            if(error instanceof EntityNotFound) {
                throw new NotFoundException({ uid: uid });
            }
            throw error;
        }

        await this.userService.updateFcmToken(id, body.fcmToken);

        const accessToken = await this.authService.getAccessToken(id, "15m");
        const refreshToken = await this.authService.getRefreshToken(id);
        return new TokenPairDto(accessToken, refreshToken);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post("login/google")
    @ApiOperation({ summary: "구글 로그인을 위한 api. 앱에서 sdk를 통해 액세스 토큰을 발급받은 후 해당 토큰을 헤더(Bearer)로 전달해주시면 됩니다." })
    @ApiSecurity("access-token")
    @ApiBody({ type: SocialLoginDto })
    @ApiResponse({ status: 201, description: "구글 로그인 성공, 이후 리프레시 토큰의 기간(한달) 동안은 재로그인 없이 액세스 토큰을 이용하시면 됩니다.", type: TokenPairDto })
    @ApiResponse({ status: 202, description: "해당 유저가 승인 대기중인 상태입니다.", type: RequestFailedDto })
    @ApiResponse({ status: 404, description: "유저가 DB에 존재하지 않습니다.(새 유저), 반환되는 uid를 이용해 회원가입을 진행해 주시면 됩니다.", example: { statusCode: 404, message: "Error processing request", response: { uid: "123456789" } } })
    @SwaggerErrorSecurityResponse()
    async googleLogin(@Body() body: SocialLoginDto, @Token() token: string | undefined) {
        if(!token) {
            throw new BadRequestException("Token not found");
        }

        const uid = await this.socialLoginHelper.getGoogleUid(token);
        if(!uid) {
            throw new UnauthorizedException("Invalid token");
        }

        const isInPending = await this.userService.checkUserInPending(uid, GOOGLE);
        if(isInPending) {
            throw new HttpException("User is in pending", 202);
        }

        let id;
        try {
            id = await this.userService.getUserIdByUidAndProvider(uid, GOOGLE);
        } catch(error) {
            if(error instanceof EntityNotFound) {
                throw new NotFoundException({ uid: uid });
            }
            throw error;
        }

        await this.userService.updateFcmToken(id, body.fcmToken);

        const accessToken = await this.authService.getAccessToken(id, "15m");
        const refreshToken = await this.authService.getRefreshToken(id);
        return new TokenPairDto(accessToken, refreshToken);
    }

    // 액세스, 리프레시 토큰의 버전을 강제로 업데이트 시키고, fcm 토큰 컬럼 값을 null로 만들어 무효화
    @UseGuards(AccessTokenGuard)
    @Delete("logout")
    @ApiOperation({ summary: "유저의 로그아웃 처리, 로그아웃 시 토큰 폐기 전에 호출해주셔야 하며, 액세스 토큰이 필요합니다." })
    @ApiSecurity("access-token")
    @ApiResponse({ status: 200, description: "로그아웃 처리 완료", type: RequestSuccessDto })
    @SwaggerErrorSecurityResponse()
    async logout(@CurrentUser() user: UserInfo) {
        const accessTokenVersion = this.authService.getTokenVersion();
        const refreshTokenVersion = this.authService.getTokenVersion();

        await this.userService.updateFcmTokenToNull(user.id);
        await this.authService.updateAccessTokenVersion(user.id, accessTokenVersion);
        await this.authService.updateRefreshTokenVersion(user.id, refreshTokenVersion);

        return new RequestSuccessDto();
    }

    @UseGuards(RefreshTokenGuard)
    @Post("token")
    @ApiOperation({ summary: "유저의 액세스 토큰을 재발급 합니다. 리프레시 토큰이 필요합니다." })
    @ApiSecurity("refresh-token")
    @ApiResponse({ status: 201, description: "액세스 토큰 재발급 성공", type: AccessTokenDto })
    @SwaggerErrorSecurityResponse()
    async refreshAccessToken(@CurrentUser() user: UserInfo) {
        const accessToken = await this.authService.getAccessToken(user.id, "15m");
        return new AccessTokenDto(accessToken);
    }
}