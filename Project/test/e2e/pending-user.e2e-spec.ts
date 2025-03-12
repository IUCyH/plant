import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { MockAppModule } from "../mocks/app/app.module";
import { AuthSharedModule } from "../../src/shared/auth-shared.module";
import { PendingUserController } from "../../src/user/pending-user.controller";
import { USER_SERVICE } from "../../src/user/interface/user-service.interface";
import { UserService } from "../../src/user/user.service";
import { PENDING_USER_SERVICE } from "../../src/user/interface/pending-user-service.interface";
import { PendingUserService } from "../../src/user/pending-user.service";
import { HashHelperService } from "../../src/common/helpers/hash-helper.service";
import { EncryptionHelperService } from "../../src/common/helpers/encryption-helper.service";
import { CreateUserDto } from "../../src/user/dto/requests/create-user.dto";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../src/user/entity/user.entity";
import { PendingUser } from "../../src/user/entity/pending-user.entity";
import { ANNOUNCEMENT_SERVICE } from "../../src/announcement/interface/announcement-service.interface";
import { AnnouncementService } from "../../src/announcement/announcement.service";
import { Announcement } from "../../src/announcement/entity/announcement.entity";

describe("Pending user", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forFeature([User]),
                TypeOrmModule.forFeature([PendingUser]),
                TypeOrmModule.forFeature([Announcement]),
                MockAppModule,
                AuthSharedModule
            ],
            controllers: [PendingUserController],
            providers: [
                HashHelperService,
                EncryptionHelperService,
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
                }
            ]
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    it("should be created", async () => {
        const userDto: CreateUserDto = new CreateUserDto();
        userDto.uid = "test10222";
        userDto.name = "hi";
        userDto.password = "abc1234";
        userDto.phone = "+8201012345678";

        // await request.default(app.getHttpServer())
        //     .post("/pending-users")
        //     .set("Content-Type", "application/json")
        //     .send(userDto)
        //     .expect(201);

        const result = await request.default(app.getHttpServer())
            .get("/pending-users")
            .expect(200);
        console.log(result.body);
    });

    // it("should be moved", async () => {
    //     await request.default(app.getHttpServer())
    //         .post("/pending-users/move/2")
    //         .expect(201);
    // });

    afterAll(async () => {
        await app.close();
    });
});