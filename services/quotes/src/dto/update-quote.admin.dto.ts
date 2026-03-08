import { PartialType } from '@nestjs/swagger';
import { CreateQuoteAdminDto } from './create-quote.admin.dto';

/**
 * Administrative DTO for updating an existing quote.
 */
export class UpdateQuoteAdminDto extends PartialType(CreateQuoteAdminDto) { }

