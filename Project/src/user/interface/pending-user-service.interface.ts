import { User } from "../entity/user.entity";
import { CreateUserDto } from "../dto/requests/create-user.dto";
import { UserDto } from "../dto/responses/user.dto";
import { QueryRunner } from "typeorm";

export const PENDING_USER_SERVICE = "PendingUserService";

export interface IPendingUserService {
    getUsers(): Promise<UserDto[]>;
    createUser(user: CreateUserDto): Promise<void>;
    deleteAndReturnUser(id: number): Promise<{ user: User, queryRunner: QueryRunner }>;
}