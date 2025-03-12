import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthSharedModule } from "../shared/auth-shared.module";
import { Post } from "./entity/post.entity";
import { User } from "../user/entity/user.entity";
import { Comment } from "./comment/entity/comment.entity";
import { PostController } from "./post.controller";
import { CleanHelperService } from "../common/helpers/clean-helper.service";
import { POST_SERVICE } from "./interface/post-service.interface";
import { PostService } from "./post.service";
import { USER_SERVICE } from "../user/interface/user-service.interface";
import { UserService } from "../user/user.service";
import { COMMENT_SERVICE } from "./comment/interface/comment-service.interface";
import { CommentService } from "./comment/comment.service";
import { HashHelperService } from "../common/helpers/hash-helper.service";
import { EncryptionHelperService } from "../common/helpers/encryption-helper.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Post]),
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Comment]),
        AuthSharedModule
    ],
    controllers: [PostController],
    providers: [
        HashHelperService,
        EncryptionHelperService,
        CleanHelperService,
        {
            provide: POST_SERVICE,
            useClass: PostService
        },
        {
            provide: USER_SERVICE,
            useClass: UserService
        },
        {
            provide: COMMENT_SERVICE,
            useClass: CommentService
        }
    ]
})
export class PostModule {}