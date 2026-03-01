import { loadSecrets } from '../../../src/loaders/secrets.loader';
import { Logger } from '@nestjs/common';

jest.mock('@nestjs/common');

describe('loadSecrets', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should return empty if infisical token is missing', async () => {
        delete process.env.INFISICAL_TOKEN;
        const secrets = await loadSecrets();

        expect(secrets).toEqual({});
        expect(Logger.prototype.warn).toHaveBeenCalledWith(expect.stringContaining('not configured'));
    });

    it('should return empty if infisical token is a dummy token', async () => {
        process.env.INFISICAL_TOKEN = 'st.dev_dummy_token';
        const secrets = await loadSecrets();

        expect(secrets).toEqual({});
    });

    it('should load required secrets if token is valid', async () => {
        process.env.INFISICAL_TOKEN = 'valid_token';
        process.env.JWT_ACCESS_SECRET = 'access123';
        process.env.DATABASE_URL = 'postgres://localhost';

        const secrets = await loadSecrets();

        expect(secrets).toHaveProperty('JWT_ACCESS_SECRET', 'access123');
        expect(secrets).toHaveProperty('DATABASE_URL', 'postgres://localhost');
        expect(secrets).not.toHaveProperty('JWT_REFRESH_SECRET'); // Was not set in env

        expect(Logger.prototype.log).toHaveBeenCalledWith(expect.stringContaining('Secrets loaded'));
    });

    it('should warn if required secrets are missing but token is valid', async () => {
        process.env.INFISICAL_TOKEN = 'valid_token';
        // None of the required secrets are set

        const secrets = await loadSecrets();

        expect(secrets).toEqual({});
        expect(Logger.prototype.warn).toHaveBeenCalledWith(expect.stringContaining('Required secret JWT_ACCESS_SECRET is not set'));
    });
});
