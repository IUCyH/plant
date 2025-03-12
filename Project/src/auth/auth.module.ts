import { Module } from "@nestjs/common";
import { AuthSharedModule } from "../shared/auth-shared.module";
import { AuthController } from "./auth.controller";
import { SocialLoginHelperService } from "../common/helpers/social-login-helper.service";
import { AUTH_SERVICE } from "./interface/auth-service.interface";
import { AuthService } from "./auth.service";

@Module({
    imports: [AuthSharedModule],
    controllers: [AuthController],
    providers: [
        SocialLoginHelperService,
        {
            provide: AUTH_SERVICE,
            useClass: AuthService
        }
    ]
})
export class AuthModule {}