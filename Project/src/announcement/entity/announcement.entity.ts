import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column
} from "typeorm";
import { User } from "../../user/entity/user.entity";

@Entity("announcements")
export class Announcement {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column("varchar", { length: 64 })
    title: string = "";

    @Column("varchar", { length: 1024 })
    content: string = "";

    @Column("int")
    userId: number = 0;

    @Column("timestamp")
    createAt: string = "";

    @ManyToOne(() => User, user => user.announcements)
    user!: User;
}