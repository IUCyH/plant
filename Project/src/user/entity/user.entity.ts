import {
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
    Column
} from "typeorm";
import { Announcement } from "../../announcement/entity/announcement.entity";
import { Post } from "../../post/entity/post.entity";
import { Comment } from "../../post/comment/entity/comment.entity";
import { Reply } from "../../post/reply/entity/reply.entity";
import { TokenVersion } from "../../tokenVersion/entity/token-version.entity";
import { WorkInfo } from "../../workInfo/entity/work-info.entity";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column("varchar", { length: 32 })
    uid: string = "";

    @Column("varchar", { length: 16 })
    loginProvider: string = "";

    @Column("varchar", { length: 16 })
    role: string = "";

    @Column("varchar", { length: 24 })
    name: string = "";

    @Column("varchar", { length: 64 })
    phone: string = "";

    @Column({ type: "boolean" })
    hasProfileImage: boolean = false;

    @Column("timestamp", { nullable: true })
    disableAt: string | null = null;

    @Column("varchar", { length: 256, nullable: true })
    fcmToken: string | null = null;

    @OneToMany(() => Announcement, announcement => announcement.user)
    announcements!: Announcement[];

    @OneToMany(() => Post, post => post.user)
    posts!: Post[];

    @OneToMany(() => Comment, comment => comment.user)
    comments!: Comment[];

    @OneToMany(() => Reply, reply => reply.user)
    replies!: Reply[];

    @OneToMany(() => TokenVersion, tokenVersion => tokenVersion.user)
    tokenVersions!: TokenVersion[];

    @OneToMany(() => WorkInfo, workInfo => workInfo.user)
    workInfos!: WorkInfo[];
}