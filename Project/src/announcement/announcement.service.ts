import { join } from "path";
import * as fs from "node:fs/promises";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { EntityNotFound } from "../common/errors/entity-not-found.error";
import { FileNotFound } from "../common/errors/file-not-found.error";

import { DateHelperService } from "../common/helpers/date-helper.service";
import { IAnnouncementService } from "./interface/announcement-service.interface";

import { UserInfo } from "../common/types/user-info.type";
import { Announcement } from "./entity/announcement.entity";
import { AnnouncementDto } from "./dto/responses/announcement.dto";
import { CreateAnnouncementDto } from "./dto/requests/create-announcement.dto";
import { UpdateAnnouncementDto } from "./dto/requests/update-announcement.dto";

@Injectable()
export class AnnouncementService implements IAnnouncementService {
    constructor(
        @InjectRepository(Announcement)
        private readonly repository: Repository<Announcement>,
        private readonly dateHelperService: DateHelperService
    ) {}

    // 해당하는 date 이전의 게시물들을 조회, 20개 제한
    async getAnnouncements(date: string): Promise<AnnouncementDto[]> {
        const results = await this.repository
            .createQueryBuilder("announcement")
            .select(["announcement.id", "announcement.title", "announcement.content", "announcement.createAt"])
            .leftJoin("announcement.user", "user", "user.disableAt IS NULL")
            .addSelect(["user.id", "user.name"])
            .where("announcement.createAt < :date", { date: date})
            .limit(20)
            .orderBy("announcement.createAt", "DESC")
            .getMany();

        if(!results || results.length === 0) {
            throw new EntityNotFound("Announcement not found");
        }

        const announcements: AnnouncementDto[] = [];
        results.forEach(result => {
            const userInfo: UserInfo = { id: result.user?.id ?? 0, name: result.user?.name ?? "탈퇴한 사용자" };

            const kst = this.dateHelperService.toKst(result.createAt);
            const dto = new AnnouncementDto(result.id, result.title, result.content, kst, userInfo);

            announcements.push(dto);
        });

        return announcements;
    }

    // 내 게시물만 조회하며, 해당하는 date 이전의 게시물들을 조회
    async getMyAnnouncements(userId: number, date: string): Promise<AnnouncementDto[]> {
        const results = await this.repository
            .createQueryBuilder("announcement")
            .select(["announcement.id", "announcement.title", "announcement.content", "announcement.createAt"])
            .where("announcement.userId = :id AND announcement.createAt < :date", { id: userId, date: date})
            .limit(20)
            .orderBy("announcement.createAt", "DESC")
            .getMany();

        if(!results || results.length === 0) {
            throw new EntityNotFound("Announcement not found");
        }

        const announcements: AnnouncementDto[] = [];
        results.forEach(result => {
            const kst = this.dateHelperService.toKst(result.createAt);
            const dto = new AnnouncementDto(result.id, result.title, result.content, kst);

            announcements.push(dto);
        });

        return announcements;
    }

    async getAnnouncementPhotoPath(id: number, order: number): Promise<string> {
        const filePath = join(process.cwd() + `/uploads/announcements/${id}/${order}-photo.jpg`);

        try {
            await fs.access(filePath);
        } catch {
            throw new FileNotFound();
        }

        return filePath;
    }

    // id에 해당하는 게시물의 사진 이름들을 가져와서 앱에서 불러올 수 있는 url로 변환
    async getAnnouncementPhotoUrls(id: number): Promise<string[]> {
        const dirPath = join(process.cwd() + `/uploads/announcements/${id}`);

        try {
            await fs.access(dirPath);
        } catch {
            throw new FileNotFound("Files not found");
        }

        const fileNames = await fs.readdir(dirPath);
        const result = fileNames.map(fileName => {
            const order = fileName.replace(/-photo\.jpg$/, "");
            const link = `/announcements/${id}/photos/${order}`;
            return link;
        });
        return result;
    }

    async createAnnouncement(announcement: CreateAnnouncementDto, userId: number): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .insert()
            .into(Announcement, ["title", "content", "userId"])
            .values({
                title: announcement.title,
                content: announcement.content,
                userId: userId
            })
            .execute();
    }

    async updateAnnouncement(id: number, userId: number, announcement: UpdateAnnouncementDto): Promise<void> {
        const exist = await this.repository.exists({
            where: { id: id, userId: userId }
        });
        if(!exist) {
            throw new EntityNotFound("Announcement not found");
        }

        await this.repository
            .createQueryBuilder()
            .update()
            .set({
                title: announcement.title,
                content: announcement.content
            })
            .where("id = :id", { id: id })
            .execute();
    }

    async deleteAnnouncement(id: number, userId: number): Promise<void> {
        const exist = await this.repository.exists({
            where: { id: id, userId: userId }
        });
        if(!exist) {
            throw new EntityNotFound("Announcement not found");
        }

        await this.repository.delete({ id: id });
    }
}