import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { REGEX } from '../constants/regex.constants';

/**
 * Validates that a parameter is a valid UUID v4 or CUID.
 */
@Injectable()
export class ParseUuidPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (REGEX.UUID_V4.test(value) || REGEX.CUID.test(value)) {
      return value;
    }
    throw new BadRequestException(`Invalid ID format: ${value}`);
  }
}
