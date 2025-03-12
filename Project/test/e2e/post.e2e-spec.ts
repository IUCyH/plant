import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MockAppModule } from "../mocks/app/app.module";
import { AuthSharedModule } from "../../src/shared/auth-shared.module";
import { PostController } from "../../src/post/post.controller";
import { POST_SERVICE } from "../../src/post/interface/post-service.interface";
import { PostService } from "../../src/post/post.service";
import { COMMENT_SERVICE } from "../../src/post/comment/interface/comment-service.interface";
import { CommentService } from "../../src/post/comment/comment.service";
import { USER_SERVICE } from "../../src/user/interface/user-service.interface";
import { UserService } from "../../src/user/user.service";
import { Post } from "../../src/post/entity/post.entity";
import { CreatePostDto } from "../../src/post/dto/requests/create-post.dto";
import { HashHelperService } from "../../src/common/helpers/hash-helper.service";
import { EncryptionHelperService } from "../../src/common/helpers/encryption-helper.service";
import { User } from "../../src/user/entity/user.entity";
import { Comment } from "../../src/post/comment/entity/comment.entity";

describe("Post e2e", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forFeature([Post]),
                TypeOrmModule.forFeature([User]),
                TypeOrmModule.forFeature([Comment]),
                MockAppModule,
                AuthSharedModule
            ],
            controllers: [PostController],
            providers: [
                HashHelperService,
                EncryptionHelperService,
                {
                    provide: POST_SERVICE,
                    useClass: PostService
                },
                {
                    provide: COMMENT_SERVICE,
                    useClass: CommentService
                },
                {
                    provide: USER_SERVICE,
                    useClass: UserService
                }
            ]
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    it("should be stored in redis", async () => {
        const createPostDto: CreatePostDto = new CreatePostDto();
        createPostDto.title = "redistest";
        createPostDto.content = "test content";

        await request.default(app.getHttpServer())
            .post("/posts")
            .set("Content-Type", "application/json")
            .send(createPostDto)
            .expect(201);
    });

    // it("should be get posts", async () => {
    //     const result = await request.default(app.getHttpServer())
    //         .get("/posts?date=0")
    //         .expect(200);
    //     console.log(result.body);
    // });
});