import { ApiStandardResponse } from '../../../src/decorators/api-standard-response.decorator';

describe('ApiStandardResponse Decorator', () => {
  it('should return an empty function', () => {
    // Currently this decorator is just a placeholder returning () => {}
    const decorator = ApiStandardResponse({ status: 200 });

    expect(typeof decorator).toBe('function');
    expect(decorator()).toBeUndefined();
  });
});
