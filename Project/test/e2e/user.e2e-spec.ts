import { Test } from "@nestjs/testing";
import * as request from "supertest";
import * as fs from "node:fs";
import { INestApplication } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MockAppModule } from "../mocks/app/app.module";
import { AuthSharedModule } from "../../src/shared/auth-shared.module";
import { User } from "../../src/user/entity/user.entity";
import { CreateUserDto } from "../../src/user/dto/requests/create-user.dto";
import { USER_SERVICE } from "../../src/user/interface/user-service.interface";
import { UserController } from "../../src/user/user.controller";
import { UserService } from "../../src/user/user.service";


describe("User e2e", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                MockAppModule,
                TypeOrmModule.forFeature([User]),
                AuthSharedModule,
            ],
            controllers: [UserController],
            providers: [
                {
                    provide: USER_SERVICE,
                    useClass: UserService
                }
            ]
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    it("should be uploaded", async () => {
        const testImagePath = __dirname + "/../test-image/profile.jpg";
        const insertUser: CreateUserDto = new CreateUserDto();

        await request.default(app.getHttpServer())
            .get("/users/1/profile-image")
            .expect(200)
            .expect("Content-Type", "image/jpeg");

        // insertUser.uid = "test3";
        // insertUser.name = "test";
        // insertUser.password = "abc1234";
        // insertUser.phone = "+8201012345678";
        //
        // console.log("Exists?", fs.existsSync(testImagePath));
        //
        // await request.default(app.getHttpServer())
        //     .post("/users")
        //     .set("Authorization", "Bearer eye")
        //     .set("Content-Type", "application/json")
        //     .send(insertUser)
        //     .expect(201);
        // await request.default(app.getHttpServer())
        //     .post("/users")
        //     .set("Authorization", "Bearer eye")
        //     .set("Content-Type", "application/json")
        //     .send(insertUser)
        //     .expect(500);
    });

    afterAll(async () => {
        await app.close();
    });
});