import { Injectable } from "@nestjs/common";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { QueryRunner, DataSource } from "typeorm";
import { Repository } from "typeorm";
import { EntityNotFound } from "../common/errors/entity-not-found.error";
import { EncryptionHelperService } from "../common/helpers/encryption-helper.service";
import { PendingUser } from "./entity/pending-user.entity";
import { IPendingUserService } from "./interface/pending-user-service.interface";
import { CreateUserDto } from "./dto/requests/create-user.dto";
import { UserDto } from "./dto/responses/user.dto";
import { User } from "./entity/user.entity";

@Injectable()
export class PendingUserService implements IPendingUserService {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @InjectRepository(PendingUser)
        private readonly repository: Repository<PendingUser>,
        private readonly encryptionHelperService: EncryptionHelperService
    ) {}

    async getUsers(): Promise<UserDto[]> {
        const results = await this.repository.find();

        const users: UserDto[] = [];
        results.forEach(result => {
            const user = new UserDto(result.id, result.uid, result.loginProvider, "user", result.name, false);
            users.push(user);
        });
        return users;
    }

    async createUser(user: CreateUserDto): Promise<void> {
        const encryptedPhone = this.encryptionHelperService.encrypt(user.phone);

        await this.repository
            .createQueryBuilder()
            .insert()
            .into(PendingUser)
            .values({
                uid: user.uid,
                loginProvider: user.provider,
                name: user.name,
                phone: encryptedPhone
            })
            .execute();
    }

    // 관리자가 유저를 승인했을 때 호출, 트랜젝션을 건 후에 pending_users 테이블에서 삭제 후 다음 작업을 위해 해당 유저 데이터와 query runner를 반환합니다.
    async deleteAndReturnUser(id: number): Promise<{ user: User, queryRunner: QueryRunner }> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await queryRunner.manager.findOne(PendingUser, {
                where: { id: id },
                select: ["id", "uid", "loginProvider", "phone", "name"]
            });
            if(!result) {
                throw new EntityNotFound("Pending user not found");
            }

            await queryRunner.manager.delete(PendingUser, { id: id});

            const user = new User();
            user.uid = result.uid;
            user.loginProvider = result.loginProvider;
            user.name = result.name;
            user.phone = result.phone;

            return { user: user, queryRunner: queryRunner };
        } catch(error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            throw error;
        }
    }
}