import { applyDecorators } from '@nestjs/common';

/**
 * A no-op decorator for standard API response documentation.
 * In a full implementation, this would use @nestjs/swagger decorators.
 */
export function ApiStandardResponse(_opts?: any): MethodDecorator & ClassDecorator {
    return applyDecorators();
}

/**
 * A no-op decorator for success response documentation.
 */
export function SuccessResponse(_opts?: any): MethodDecorator & ClassDecorator {
    return applyDecorators();
}

/**
 * A no-op decorator for idempotent endpoint marking.
 */
export function Idempotent(): MethodDecorator {
    return applyDecorators();
}
