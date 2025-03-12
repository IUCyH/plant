import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryRunner, Not, IsNull } from "typeorm";
import { join } from "path";
import * as fs from "node:fs/promises";

import { CleanHelperService } from "../common/helpers/clean-helper.service";
import { IUserService } from "./interface/user-service.interface";
import { KAKAO } from "../common/helpers/social-login-helper.service";

import { EntityNotFound } from "../common/errors/entity-not-found.error";
import { FileNotFound } from "../common/errors/file-not-found.error";

import { User } from "./entity/user.entity";
import { UserDto } from "./dto/responses/user.dto";
import { UpdateUserDto } from "./dto/requests/update-user.dto";
import { CreateUserDto } from "./dto/requests/create-user.dto";

@Injectable()
export class UserService implements IUserService {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
        private readonly cleanHelperService: CleanHelperService
    ) {}

    async getUser(id: number): Promise<UserDto> {
        const result = await this.repository.findOne({
            where: { id: id },
            select: ["id", "uid", "loginProvider", "role", "name", "hasProfileImage"]
        });

        if(!result) {
            throw new EntityNotFound("User not found");
        }

        const user = new UserDto(result.id, result.uid, result.loginProvider, result.role, result.name, result.hasProfileImage);
        return user;
    }

    async getProfileImagePath(id: number): Promise<string> {
        const filePath = join(process.cwd(), `/uploads/profiles/${id}-profile.jpg`);

        try {
            await fs.access(filePath);
        } catch {
            throw new FileNotFound();
        }

        return filePath;
    }

    async createAdmin(user: CreateUserDto): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .insert()
            .into(User, ["uid", "loginProvider", "name", "phone", "role"])
            .values({
                uid: user.uid,
                loginProvider: KAKAO,
                name: user.name,
                phone: user.phone,
                role: "admin"
            })
            .execute();
    }

    // 유저를 실제로 생성합니다. pending-user.service의 작업을 이어받아서 유저를 users 테이블에 생성 후 트랜젝션을 커밋합니다.
    async createUser(user: User, queryRunner: QueryRunner): Promise<void> {
        try {
            const isDisabledUser = await queryRunner.manager.exists(User, {
                where: { uid: user.uid, loginProvider: user.loginProvider, disableAt: Not(IsNull()) }
            });

            if(isDisabledUser) {
                await queryRunner.manager.update(
                    User,
                    { uid: user.uid, loginProvider: user.loginProvider },
                    {
                        name: user.name,
                        phone: user.phone,
                        disableAt: null
                    }
                );
            } else {
                await queryRunner.manager
                    .createQueryBuilder()
                    .insert()
                    .into(User, ["uid", "loginProvider", "name", "phone"])
                    .values({
                        uid: user.uid,
                        loginProvider: user.loginProvider,
                        name: user.name,
                        phone: user.phone
                    })
                    .execute();
            }

            await queryRunner.commitTransaction();
            await queryRunner.release();
        } catch(error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            throw error;
        }
    }

    async updateUser(id: number, user: UpdateUserDto): Promise<void> {
        const exist = await this.repository.exists({
            where: { id: id }
        });
        if(!exist) {
            throw new EntityNotFound("User not found");
        }

        await this.repository
            .createQueryBuilder()
            .update()
            .set({
                uid: user.uid,
                name: user.name
            })
            .where("id = :id", { id: id })
            .execute();
    }

    // 유저 비활성화 처리 및 관련된 데이터(토큰 버전, 일정)를 삭제합니다.
    async disableUser(id: number): Promise<void> {
        const exist = await this.repository.exists({
            where: { id: id }
        });
        if(!exist) {
            throw new EntityNotFound("User not found");
        }

        await this.cleanHelperService.cleanUserRelatedData(id);
        await this.repository.update({ id: id }, { disableAt: new Date().toISOString() });
    }

    async deleteProfileImage(id: number): Promise<void> {
        const filePath = join(process.cwd(), `/uploads/profiles/${id}-profile.jpg`);

        try {
            await fs.access(filePath);
        } catch {
            throw new FileNotFound();
        }

        await fs.unlink(filePath);
        await this.repository.update({ id: id }, { hasProfileImage: false });
    }
}