import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenVersion } from "./entity/token-version.entity";
import { TokenVersionService } from "./token-version.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([TokenVersion])
    ],
    controllers: [],
    providers: [TokenVersionService],
    exports: [TokenVersionService]
})
export class TokenVersionModule {}