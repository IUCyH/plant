import {
    Entity,
    Column,
    PrimaryGeneratedColumn
} from "typeorm";

@Entity("pending_users")
export class PendingUser {
    @PrimaryGeneratedColumn()
    id: number = 0;

    @Column("varchar", { length: 32 })
    uid: string = "";

    @Column("varchar", { length: 16 })
    loginProvider: string = "";

    @Column("varchar", { length: 24 })
    name: string = "";

    @Column("varchar", { length: 64 })
    phone: string = "";
}