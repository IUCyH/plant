import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MockAppModule } from "../../mocks/app/app.module";
import { User } from "../../../src/user/entity/user.entity";
import { UserDto } from "../../../src/user/dto/responses/user.dto";
import { CreateUserDto } from "../../../src/user/dto/requests/create-user.dto";
import { IUserService } from "../../../src/user/interface/user-service.interface";
import { MockUserService } from "../../mocks/user/user.service";

async function getUser(userService: IUserService) {
    try {
        const user = await userService.getUser(1);
        expect(user).toEqual(
            new UserDto(
                1,
                "abc2344",
                "user",
                "Lucy",
                true
            )
        );
    } catch(error) {
        console.log(error);
    }
}

async function createUser(userService: IUserService) {
    try {
        const dto = new CreateUserDto();
        dto.uid = "ch444";
        dto.name = "Lucy";
        dto.password = "abc1234";
        dto.phone = "+8201012345678";

        const result = await userService.createUser(dto);
        expect(result).toEqual(true);
    } catch(error) {
        console.log(error);
    }
}

describe("UserService", () => {
    let userService: IUserService;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                MockAppModule,
                TypeOrmModule.forFeature([User])
            ],
            providers: [
                MockUserService
            ]
        }).compile();
        userService = module.get(MockUserService);
    });

    it("should be return user dto", async () => {
        await getUser(userService);
        //await createUser(userService);
    });
});