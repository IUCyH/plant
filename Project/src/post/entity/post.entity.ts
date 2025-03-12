import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    Column
} from "typeorm";
import { User } from "../../user/entity/user.entity";
import { Comment } from "../comment/entity/comment.entity";

@Entity("posts")
export class Post {
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

    @ManyToOne(() => User, user => user.posts)
    user!: User;

    @OneToMany(() => Comment, comment => comment.post)
    comments!: Comment[];
}