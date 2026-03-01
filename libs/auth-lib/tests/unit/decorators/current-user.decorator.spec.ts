import { CurrentUser } from '../../../../src/decorators/current-user.decorator';

describe('CurrentUser Re-export', () => {
    it('should be defined', () => {
        expect(CurrentUser).toBeDefined();
        expect(typeof CurrentUser).toBe('function');
    });
});
