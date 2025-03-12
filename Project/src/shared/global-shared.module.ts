import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/entity/user.entity";
import { PendingUser } from "../user/entity/pending-user.entity";
import { TypeHelperService } from "../common/helpers/type-helper.service";
import { DateHelperService } from "../common/helpers/date-helper.service";
import { UserCommonService } from "../common/service/user-common.service";
import { HashHelperService } from "../common/helpers/hash-helper.service";
import { EncryptionHelperService } from "../common/helpers/encryption-helper.service";
import { FcmHelperService } from "../common/helpers/fcm-helper.service";

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([PendingUser])
    ],
    controllers: [],
    providers: [
        HashHelperService,
        EncryptionHelperService,
        TypeHelperService,
        DateHelperService,
        UserCommonService,
        FcmHelperService
    ],
    exports: [
        HashHelperService,
        EncryptionHelperService,
        TypeHelperService,
        DateHelperService,
        UserCommonService,
        FcmHelperService
    ]
})
export class GlobalSharedModule {}