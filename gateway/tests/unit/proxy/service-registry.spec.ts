import {
  getServiceConfig,
  getServiceNames,
  isServiceRegistered,
  SERVICE_REGISTRY,
} from '../../../src/proxy/service-registry';

describe('ServiceRegistry', () => {
  describe('getServiceConfig', () => {
    it('should return config for a registered service', () => {
      const config = getServiceConfig('auth');
      expect(config).toBeDefined();
      expect(config?.url).toBeDefined();
      expect(config?.timeout).toBe(5000);
    });

    it('should return undefined for an unregistered service', () => {
      const config = getServiceConfig('non-existent');
      expect(config).toBeUndefined();
    });
  });

  describe('getServiceNames', () => {
    it('should return all registered service names', () => {
      const names = getServiceNames();
      const expectedNames = Object.keys(SERVICE_REGISTRY);
      expect(names).toEqual(expect.arrayContaining(expectedNames));
      expect(names.length).toBe(expectedNames.length);
    });
  });

  describe('isServiceRegistered', () => {
    it('should return true for a registered service', () => {
      expect(isServiceRegistered('auth')).toBe(true);
      expect(isServiceRegistered('users')).toBe(true);
    });

    it('should return false for an unregistered service', () => {
      expect(isServiceRegistered('non-existent')).toBe(false);
    });
  });
});
