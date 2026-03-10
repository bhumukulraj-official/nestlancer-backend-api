import { AppValidationPipe } from '../../../src/pipes/validation.pipe';
import { BadRequestException } from '@nestjs/common';

describe('AppValidationPipe', () => {
  let pipe: AppValidationPipe;

  beforeEach(() => {
    pipe = new AppValidationPipe();
  });

  it('should throw BadRequestException with formatted payload on failure', async () => {
    const value = { invalidField: 'test' };
    try {
      // Need a dummy class for validation
      class DummyDto {}
      await pipe.transform(value, { type: 'body', metatype: DummyDto });
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      const response = (e as BadRequestException).getResponse() as any;
      expect(response.status).toBe('error');
      expect(response.error.code).toBeDefined();
      expect(response.error.message).toBe('Request validation failed');
      expect(response.error.details).toBeDefined();
    }
  });
});
