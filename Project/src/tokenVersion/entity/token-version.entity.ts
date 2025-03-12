import {
    Entity,
    PrimaryColumn,
    Column,
    ManyToOne
} from "typeorm";
import { User } from "../../user/entity/user.entity";

@Entity("token_versions")
export class TokenVersion {
    @PrimaryColumn()
    userId: number = 0;

    @PrimaryColumn()
    type: string = "";

    @Column("varchar", { length: 32 })
    version: string = "";

    @ManyToOne(() => User, user => user.tokenVersions)
    user!: User;
}