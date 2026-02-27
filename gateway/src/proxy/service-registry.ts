/**
 * Service Registry - Maps service names to their URLs
 * Centralized configuration for microservice discovery
 */

export interface ServiceConfig {
  url: string;
  timeout: number;
  healthEndpoint: string;
}

export const SERVICE_REGISTRY: Record<string, ServiceConfig> = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    timeout: 5000,
    healthEndpoint: '/api/v1/auth/health',
  },
  users: {
    url: process.env.USERS_SERVICE_URL || 'http://localhost:3002',
    timeout: 5000,
    healthEndpoint: '/health',
  },
  payments: {
    url: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3003',
    timeout: 10000,
    healthEndpoint: '/api/v1/payments/health',
  },
  webhooks: {
    url: process.env.WEBHOOKS_SERVICE_URL || 'http://localhost:3004',
    timeout: 10000,
    healthEndpoint: '/api/v1/webhooks/health',
  },
  admin: {
    url: process.env.ADMIN_SERVICE_URL || 'http://localhost:3005',
    timeout: 5000,
    healthEndpoint: '/api/v1/admin/health',
  },
  requests: {
    url: process.env.REQUESTS_SERVICE_URL || 'http://localhost:3006',
    timeout: 5000,
    healthEndpoint: '/api/v1/requests/health',
  },
  quotes: {
    url: process.env.QUOTES_SERVICE_URL || 'http://localhost:3007',
    timeout: 5000,
    healthEndpoint: '/api/v1/quotes/health',
  },
  projects: {
    url: process.env.PROJECTS_SERVICE_URL || 'http://localhost:3008',
    timeout: 5000,
    healthEndpoint: '/api/v1/projects/health',
  },
  progress: {
    url: process.env.PROGRESS_SERVICE_URL || 'http://localhost:3009',
    timeout: 5000,
    healthEndpoint: '/api/v1/progress/health',
  },
  messaging: {
    url: process.env.MESSAGING_SERVICE_URL || 'http://localhost:3010',
    timeout: 5000,
    healthEndpoint: '/api/v1/messages/health',
  },
  notifications: {
    url: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3011',
    timeout: 5000,
    healthEndpoint: '/api/v1/notifications/health',
  },
  media: {
    url: process.env.MEDIA_SERVICE_URL || 'http://localhost:3012',
    timeout: 30000,
    healthEndpoint: '/api/v1/media/health',
  },
  portfolio: {
    url: process.env.PORTFOLIO_SERVICE_URL || 'http://localhost:3013',
    timeout: 5000,
    healthEndpoint: '/api/v1/portfolio/health',
  },
  blog: {
    url: process.env.BLOG_SERVICE_URL || 'http://localhost:3014',
    timeout: 5000,
    healthEndpoint: '/api/v1/blog/health',
  },
  contact: {
    url: process.env.CONTACT_SERVICE_URL || 'http://localhost:3015',
    timeout: 5000,
    healthEndpoint: '/api/v1/contact/health',
  },
  health: {
    url: process.env.HEALTH_SERVICE_URL || 'http://localhost:3016',
    timeout: 5000,
    healthEndpoint: '/api/v1/health',
  },
};

/**
 * Get service configuration by name
 */
export function getServiceConfig(serviceName: string): ServiceConfig | undefined {
  return SERVICE_REGISTRY[serviceName];
}

/**
 * Get all registered service names
 */
export function getServiceNames(): string[] {
  return Object.keys(SERVICE_REGISTRY);
}

/**
 * Check if a service is registered
 */
export function isServiceRegistered(serviceName: string): boolean {
  return serviceName in SERVICE_REGISTRY;
}
