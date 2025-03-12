import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, IsNull } from "typeorm";
import { EntityNotFound } from "../errors/entity-not-found.error";
import { User } from "../../user/entity/user.entity";
import { PendingUser } from "../../user/entity/pending-user.entity";
import { EncryptionHelperService } from "../helpers/encryption-helper.service";

@Injectable()
export class UserCommonService {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
        @InjectRepository(PendingUser)
        private readonly pendingUserRepository: Repository<PendingUser>,
        private readonly encryptionHelperService: EncryptionHelperService,
    ) {}

    async checkIsDisabledUser(uid: string, provider: string): Promise<boolean> {
        const result = await this.repository.exists({
            where: { uid: uid, loginProvider: provider, disableAt: Not(IsNull()) },
        });
        return result;
    }

    async getUserName(id: number): Promise<string> {
        const result = await this.repository.findOne({
            where: { id: id },
            select: ["name"]
        });
        if(!result) {
            throw new EntityNotFound("User name not found");
        }

        return result.name;
    }

    async getUserUid(phone: string): Promise<string> {
        const encryptedPhone = this.encryptionHelperService.encrypt(phone);
        const result = await this.repository.findOne({
            where: { phone: encryptedPhone },
            select: ["uid"]
        });
        if(!result) {
            throw new EntityNotFound("User uid not found");
        }

        const uid = result.uid.replace(/.{4}$/, "****");
        return uid;
    }

    async getUserIdByUidAndPhone(uid: string, phone: string): Promise<number> {
        const encryptedPhone = this.encryptionHelperService.encrypt(phone);

        const result = await this.repository.findOne({
            where: { uid: uid, phone: encryptedPhone },
            select: ["id"]
        });
        if(!result) {
            throw new EntityNotFound("User id not found");
        }

        return result.id;
    }

    async getUserIdByUidAndProvider(uid: string, provider: string) {
        const result = await this.repository.findOne({
            where: { uid: uid, loginProvider: provider, disableAt: IsNull() },
            select: ["id"]
        });
        if(!result) {
            throw new EntityNotFound("User id not found");
        }

        return result.id;
    }

    async getUserFcmToken(id: number): Promise<string | null> {
        const result = await this.repository.findOne({
            where: { id: id },
            select: ["fcmToken"]
        });
        if(!result) {
            return null;
        }

        return result.fcmToken;
    }

    async checkIsUserAdmin(id: number): Promise<boolean> {
        const exist = await this.repository.exists({
            where: { id: id, role: "admin" }
        });
        return exist;
    }

    async checkUserExists(id: number): Promise<boolean> {
        const exist = await this.repository.exists({
            where: { id: id }
        });
        return exist;
    }

    async checkUserUidExists(uid: string, provider: string): Promise<boolean> {
        const exist = await this.repository.exists({
            where: { uid: uid, loginProvider: provider }
        });
        return exist;
    }

    async checkUserPhoneExists(phone: string): Promise<boolean> {
        const encryptedPhone = this.encryptionHelperService.encrypt(phone);
        const exist = await this.repository.exists({
            where: { phone: encryptedPhone }
        });
        return exist;
    }

    async checkUserInPending(uid: string, provider: string): Promise<boolean> {
        const exist = await this.pendingUserRepository.exists({
            where: { uid: uid, loginProvider: provider }
        });
        return exist;
    }

    async updateFcmToken(id: number, token: string): Promise<void> {
        await this.repository.update({ id: id }, { fcmToken: token });
    }

    async updateFcmTokenToNull(id: number): Promise<void> {
        await this.repository.update({ id: id }, { fcmToken: null });
    }
}