import { JwtStrategy } from '../../src/strategies/jwt.strategy';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;

    beforeEach(() => {
        process.env.JWT_ACCESS_SECRET = 'test-secret';
        strategy = new JwtStrategy();
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    it('should validate and return the user payload', async () => {
        const payload = {
            sub: 'user-1',
            email: 'test@example.com',
            role: 'user',
            iat: 123456,
            exp: 789012,
        };

        const result = await strategy.validate(payload);

        expect(result).toEqual({
            userId: 'user-1',
            email: 'test@example.com',
            role: 'user',
            iat: 123456,
            exp: 789012,
        });
    });
});
