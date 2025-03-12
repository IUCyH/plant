import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as request from "supertest";
import { MockAppModule } from "../mocks/app/app.module";
import { AuthSharedModule } from "../../src/shared/auth-shared.module";
import { EncryptionHelperService } from "../../src/common/helpers/encryption-helper.service";
import { HashHelperService } from "../../src/common/helpers/hash-helper.service";
import { Announcement } from "../../src/announcement/entity/announcement.entity";
import { AnnouncementController } from "../../src/announcement/announcement.controller";
import { ANNOUNCEMENT_SERVICE } from "../../src/announcement/interface/announcement-service.interface";
import { AnnouncementService } from "../../src/announcement/announcement.service";
import { User } from "../../src/user/entity/user.entity";
import { USER_SERVICE } from "../../src/user/interface/user-service.interface";
import { UserService } from "../../src/user/user.service";
import { CreateAnnouncementDto } from "../../src/announcement/dto/requests/create-announcement.dto";

describe("Announcement e2e", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forFeature([Announcement]),
                TypeOrmModule.forFeature([User]),
                MockAppModule,
                AuthSharedModule
            ],
            controllers: [AnnouncementController],
            providers: [
                EncryptionHelperService,
                HashHelperService,
                {
                    provide: ANNOUNCEMENT_SERVICE,
                    useClass: AnnouncementService
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

    it("should be uploaded", async () => {
        const testImagePath1 = __dirname + "/../test-image/1_photo.jpg";
        const testImagePath2 = __dirname + "/../test-image/2_photo.jpg";
        const testImagePath3 = __dirname + "/../test-image/3_photo.jpg";

        const insertAnnouncement: CreateAnnouncementDto = new CreateAnnouncementDto();
        insertAnnouncement.title = "test";
        insertAnnouncement.content = "test content";

        // await request.default(app.getHttpServer())
        //     .post("/announcements")
        //     .set("Content-Type", "application/json")
        //     .send(insertAnnouncement)
        //     .expect(201);

        // await request.default(app.getHttpServer())
        //     .post("/announcements/1/photos")
        //     .set("Content-Type", "multipart/form-data")
        //     .attach("photo", testImagePath1)
        //     .attach("photo", testImagePath2)
        //     //.attach("photo", testImagePath3)
        //     .expect(201);

        await request.default(app.getHttpServer())
            .get("/announcements/1/photos/1")
            .expect(200)
            .expect("Content-Type", "image/jpeg");
    });
});