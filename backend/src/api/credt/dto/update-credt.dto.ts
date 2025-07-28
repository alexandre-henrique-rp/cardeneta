import { PartialType } from '@nestjs/swagger';
import { CreateCredtDto } from './create-credt.dto';

export class UpdateCredtDto extends PartialType(CreateCredtDto) {}
