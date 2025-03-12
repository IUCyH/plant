import { IUserService } from "../../../src/user/interface/user-service.interface";
import { UserDto } from "../../../src/user/dto/responses/user.dto";
import { CreateUserDto } from "../../../src/user/dto/requests/create-user.dto";
import { UpdateUserDto } from "../../../src/user/dto/requests/update-user.dto";

export class MockUserService implements IUserService {
    getUser(id: number): Promise<UserDto> {
        const dto = new UserDto(id, "abc12", "user", "Lucy", false);
        return Promise.resolve(dto);
    }

    getUserUid(phone: string): Promise<string> {
        return Promise.resolve("abc12");
    }

    getUserIdByUidAndPhone(uid: string, phone: string): Promise<number> {
        return Promise.resolve(1);
    }

    getUserIdByUidAndPassword(uid: string, password: string): Promise<number> {
        return Promise.resolve(1);
    }

    getProfileImagePath(id: number): string {
        return "";
    }

    checkUserIsAdmin(id: number): Promise<boolean> {
        return Promise.resolve(true);
    }

    createUser(user: CreateUserDto): Promise<void> {
        return Promise.resolve();
    }

    updateUser(id: number, user: UpdateUserDto): Promise<void> {
        return Promise.resolve();
    }

    deleteUser(id: number): Promise<void> {
        return Promise.resolve();
    }
}