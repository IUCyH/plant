import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException
} from "@nestjs/common";

@Injectable()
export class UpdateBodyValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if(!value || Object.values(value).every(v => v === undefined)) {
            throw new BadRequestException("Please provide at least one field to update");
        }
        return value;
    }
}