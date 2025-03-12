import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthSharedModule } from "../shared/auth-shared.module";
import { Announcement } from "./entity/announcement.entity";
import { User } from "../user/entity/user.entity";
import { CleanHelperService } from "../common/helpers/clean-helper.service";
import { ANNOUNCEMENT_SERVICE } from "./interface/announcement-service.interface";
import { AnnouncementService } from "./announcement.service";
import { USER_SERVICE } from "../user/interface/user-service.interface";
import { UserService } from "../user/user.service";
import { AnnouncementController } from "./announcement.controller";
import { HashHelperService } from "../common/helpers/hash-helper.service";
import { EncryptionHelperService } from "../common/helpers/encryption-helper.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Announcement]),
        TypeOrmModule.forFeature([User]),
        AuthSharedModule
    ],
    controllers: [AnnouncementController],
    providers: [
        HashHelperService,
        EncryptionHelperService,
        CleanHelperService,
        {
            provide: ANNOUNCEMENT_SERVICE,
            useClass: AnnouncementService
        },
        {
            provide: USER_SERVICE,
            useClass: UserService
        }
    ]
})
export class AnnouncementModule {}