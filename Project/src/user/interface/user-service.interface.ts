import { QueryRunner } from "typeorm";
import { User } from "../entity/user.entity";
import { UserDto } from "../dto/responses/user.dto";
import { CreateUserDto } from "../dto/requests/create-user.dto";
import { UpdateUserDto } from "../dto/requests/update-user.dto";

export const USER_SERVICE = "UserService";

export interface IUserService {
    getUser(id: number): Promise<UserDto>;
    getProfileImagePath(id: number): Promise<string>;
    createAdmin(user: CreateUserDto): Promise<void>;
    createUser(user: User, queryRunner: QueryRunner): Promise<void>;
    updateUser(id: number, user: UpdateUserDto): Promise<void>;
    disableUser(id: number): Promise<void>;
    deleteProfileImage(id: number): Promise<void>;
}