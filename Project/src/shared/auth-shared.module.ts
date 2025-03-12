import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TokenVersionModule } from "../tokenVersion/token-version.module";
import { TokenHelperService } from "../common/helpers/token-helper.service";

import { AccessTokenStrategy } from "../common/strategies/access-token.strategy";
import { RefreshTokenStrategy } from "../common/strategies/refresh-token.strategy";

import { AccessTokenGuard } from "../common/guards/access-token.guard";
import { RefreshTokenGuard } from "../common/guards/refresh-token.guard";

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.JWT_KEY,
                signOptions: { expiresIn: "30d" }
            })
        }),
        TokenVersionModule
    ],
    controllers: [],
    providers: [
        TokenHelperService,
        AccessTokenStrategy,
        RefreshTokenStrategy,
        AccessTokenGuard,
        RefreshTokenGuard
    ],
    exports: [
        TokenVersionModule,
        TokenHelperService,
        AccessTokenStrategy,
        RefreshTokenStrategy,
        AccessTokenGuard,
        RefreshTokenGuard
    ]
})
export class AuthSharedModule {}