import { Injectable } from "@nestjs/common";

@Injectable()
export class DateHelperService {
    toKst(utcDate: string): string {
        const date = new Date(`${utcDate}Z`);
        const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);

        const result = kst.toISOString().replace("Z", "+09:00");
        return result;
    }
}