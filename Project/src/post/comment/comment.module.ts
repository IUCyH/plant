import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthSharedModule } from "../../shared/auth-shared.module";
import { Reply } from "../reply/entity/reply.entity";
import { User } from "../../user/entity/user.entity";
import { CommentController } from "./comment.controller";
import { CleanHelperService } from "../../common/helpers/clean-helper.service";
import { REPLY_SERVICE } from "../reply/interface/reply-service.interface";
import { ReplyService } from "../reply/reply.service";
import { USER_SERVICE } from "../../user/interface/user-service.interface";
import { UserService } from "../../user/user.service";
import { HashHelperService } from "../../common/helpers/hash-helper.service";
import { EncryptionHelperService } from "../../common/helpers/encryption-helper.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Reply]),
        TypeOrmModule.forFeature([User]),
        AuthSharedModule
    ],
    controllers: [CommentController],
    providers: [
        HashHelperService,
        EncryptionHelperService,
        CleanHelperService,
        {
            provide: REPLY_SERVICE,
            useClass: ReplyService
        },
        {
            provide: USER_SERVICE,
            useClass: UserService
        }
    ]
})
export class CommentModule {}