import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthSharedModule } from "../shared/auth-shared.module";

import { USER_SERVICE } from "./interface/user-service.interface";
import { PENDING_USER_SERVICE } from "./interface/pending-user-service.interface";
import { ANNOUNCEMENT_SERVICE } from "../announcement/interface/announcement-service.interface";
import { POST_SERVICE } from "../post/interface/post-service.interface";

import { User } from "./entity/user.entity";
import { PendingUser } from "./entity/pending-user.entity";
import { UserController } from "./user.controller";
import { PendingUserController } from "./pending-user.controller";
import { CleanHelperService } from "../common/helpers/clean-helper.service";

import { UserService } from "./user.service";
import { PendingUserService } from "./pending-user.service";

import { Announcement } from "../announcement/entity/announcement.entity";
import { AnnouncementService } from "../announcement/announcement.service";

import { Post } from "../post/entity/post.entity";
import { PostService } from "../post/post.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([PendingUser]),
        TypeOrmModule.forFeature([Announcement]),
        TypeOrmModule.forFeature([Post]),
        AuthSharedModule
    ],
    controllers: [
        UserController,
        PendingUserController
    ],
    providers: [
        CleanHelperService,
        {
            provide: USER_SERVICE,
            useClass: UserService
        },
        {
            provide: PENDING_USER_SERVICE,
            useClass: PendingUserService
        },
        {
            provide: ANNOUNCEMENT_SERVICE,
            useClass: AnnouncementService
        },
        {
            provide: POST_SERVICE,
            useClass: PostService
        }
    ]
})
export class UserModule {}