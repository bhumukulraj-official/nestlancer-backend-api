import { PartialType } from '@nestjs/mapped-types';
import { CreateQuoteAdminDto } from './create-quote.admin.dto';

export class UpdateQuoteAdminDto extends PartialType(CreateQuoteAdminDto) { }
