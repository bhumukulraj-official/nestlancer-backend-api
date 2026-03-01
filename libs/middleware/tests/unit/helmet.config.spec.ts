import { getHelmetConfig } from '../../../../src/helmet.config';

describe('Helmet Config', () => {
    it('should return strict security headers configuration', () => {
        const config = getHelmetConfig();

        expect(config.referrerPolicy.policy).toBe('strict-origin-when-cross-origin');
        expect(config.hsts.maxAge).toBe(31536000);
        expect(config.hsts.includeSubDomains).toBe(true);
        expect(config.contentSecurityPolicy.directives.defaultSrc).toContain("'self'");
    });
});
