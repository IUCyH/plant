import { AnnouncementDto } from "../dto/responses/announcement.dto";
import { CreateAnnouncementDto } from "../dto/requests/create-announcement.dto";
import { UpdateAnnouncementDto } from "../dto/requests/update-announcement.dto";

export const ANNOUNCEMENT_SERVICE = "AnnouncementService";

export interface IAnnouncementService {
    getAnnouncements(date: string): Promise<AnnouncementDto[]>;
    getMyAnnouncements(userId: number, date: string): Promise<AnnouncementDto[]>;
    getAnnouncementPhotoPath(id: number, order: number): Promise<string>;
    getAnnouncementPhotoUrls(id: number): Promise<string[]>;
    createAnnouncement(announcement: CreateAnnouncementDto, userId: number): Promise<void>;
    updateAnnouncement(id: number, userId: number, announcement: UpdateAnnouncementDto): Promise<void>;
    deleteAnnouncement(id: number, userId: number): Promise<void>;
}