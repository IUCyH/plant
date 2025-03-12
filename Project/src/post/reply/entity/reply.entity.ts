import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column
} from "typeorm";
import { Comment } from "../../comment/entity/comment.entity";
import { User } from "../../../user/entity/user.entity";

@Entity("replies")
export class Reply {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column("varchar", { length: 128 })
    content: string = "";

    @Column("int")
    commentId: number = 0;

    @Column("int")
    userId: number = 0;

    @Column("timestamp")
    createAt: string = "";

    @ManyToOne(() => User, user => user.replies)
    user!: User;

    @ManyToOne(() => Comment, comment => comment.replies)
    comment!: Comment;
}