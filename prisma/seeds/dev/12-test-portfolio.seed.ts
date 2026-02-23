import { PrismaClient } from '../../../generated';

/**
 * Seed test portfolio items for development.
 */
export async function seedTestPortfolio(prisma: PrismaClient): Promise<void> {
    console.log('    🎨 Seeding test portfolio items...');

    const items = [
        {
            title: 'HealthTech Dashboard',
            slug: 'healthtech-dashboard',
            shortDescription: 'Real-time patient monitoring dashboard for hospitals.',
            longDescription: 'Built a comprehensive healthcare analytics platform with real-time vitals monitoring, appointment scheduling, and HIPAA-compliant data storage. Used Next.js, NestJS, and PostgreSQL with WebSocket for live updates.',
            category: 'web-development',
            tags: ['React', 'NestJS', 'PostgreSQL', 'WebSocket', 'Healthcare'],
            status: 'PUBLISHED' as const,
            featured: true,
            displayOrder: 1,
            clientName: 'MedCorp India',
            clientTestimonial: 'Exceptional quality and attention to detail. Delivered ahead of schedule.',
            technologies: ['Next.js', 'NestJS', 'PostgreSQL', 'Redis', 'Docker'],
            results: { users: '500+ doctors', uptime: '99.9%', loadTime: '<2s' },
            publishedAt: new Date(),
        },
        {
            title: 'E-Commerce Mobile App',
            slug: 'ecommerce-mobile-app',
            shortDescription: 'Cross-platform shopping app with Razorpay integration.',
            longDescription: 'Developed a React Native e-commerce app with product catalog, cart, wishlists, and Razorpay payment gateway. Features include push notifications, order tracking, and offline mode.',
            category: 'mobile-app',
            tags: ['React Native', 'Node.js', 'Razorpay', 'TypeScript'],
            status: 'PUBLISHED' as const,
            featured: true,
            displayOrder: 2,
            clientName: 'ShopEasy',
            technologies: ['React Native', 'Node.js', 'MongoDB', 'Razorpay'],
            publishedAt: new Date(),
        },
        {
            title: 'SaaS Analytics Platform',
            slug: 'saas-analytics-platform',
            shortDescription: 'Business intelligence platform with custom dashboards.',
            longDescription: 'Built a multi-tenant SaaS analytics platform with customizable dashboards, data visualization, and automated reporting. Processes millions of events daily.',
            category: 'web-development',
            tags: ['Vue.js', 'Python', 'PostgreSQL', 'Redis', 'Analytics'],
            status: 'DRAFT' as const,
            featured: false,
            displayOrder: 3,
            technologies: ['Vue.js', 'FastAPI', 'PostgreSQL', 'Redis', 'ClickHouse'],
        },
    ];

    for (const item of items) {
        await prisma.portfolioItem.upsert({
            where: { slug: item.slug },
            update: {},
            create: item,
        });
    }

    console.log('    ✅ Test portfolio items seeded');
}
