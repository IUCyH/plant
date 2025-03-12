import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    Column
} from "typeorm";
import { Post } from "../../entity/post.entity";
import { Reply } from "../../reply/entity/reply.entity";
import { User } from "../../../user/entity/user.entity";

@Entity("comments")
export class Comment {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column("varchar", { length: 128 })
    content: string = "";

    @Column("int")
    postId: number = 0;

    @Column("int")
    userId: number = 0;

    @Column("timestamp")
    createAt: string = "";

    @ManyToOne(() => Post, post => post.comments)
    post!: Post;

    @ManyToOne(() => User, user => user.comments)
    user!: User;

    @OneToMany(() => Reply, reply => reply.comment)
    replies!: Reply[];
}