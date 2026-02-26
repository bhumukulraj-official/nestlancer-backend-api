import { PrismaClient } from '@prisma/client';

/**
 * Seed default blog categories, portfolio categories,
 * and project request categories (stored in SystemConfig).
 */
export async function seedCategories(prisma: PrismaClient): Promise<void> {
    console.log('  📂 Seeding categories...');

    // Blog categories
    const blogCategories = [
        { name: 'Technology', slug: 'technology', description: 'Tech articles and tutorials' },
        { name: 'Design', slug: 'design', description: 'UI/UX design insights' },
        { name: 'Business', slug: 'business', description: 'Business and freelancing tips' },
        { name: 'Case Studies', slug: 'case-studies', description: 'Project case studies and retrospectives' },
        { name: 'Tutorials', slug: 'tutorials', description: 'Step-by-step development tutorials' },
        { name: 'Industry News', slug: 'industry-news', description: 'Latest industry updates' },
    ];

    for (const category of blogCategories) {
        await prisma.blogCategory.upsert({
            where: { slug: category.slug },
            update: {},
            create: category,
        });
    }

    // Portfolio categories (using the new PortfolioCategory model)
    const portfolioCategories = [
        { name: 'Web Development', slug: 'web-development' },
        { name: 'Mobile App', slug: 'mobile-app' },
        { name: 'UI/UX Design', slug: 'ui-ux-design' },
        { name: 'E-Commerce', slug: 'ecommerce' },
        { name: 'API Development', slug: 'api-development' },
        { name: 'DevOps & Cloud', slug: 'devops-cloud' },
    ];

    for (const category of portfolioCategories) {
        await prisma.portfolioCategory.upsert({
            where: { slug: category.slug },
            update: {},
            create: category,
        });
    }

    // Store request categories as system config
    await prisma.systemConfig.upsert({
        where: { key: 'request.categories' },
        update: {},
        create: {
            key: 'request.categories',
            value: [
                { key: 'web-development', label: 'Web Development', description: 'Full-stack web applications' },
                { key: 'mobile-app', label: 'Mobile App', description: 'iOS and Android applications' },
                { key: 'ui-ux-design', label: 'UI/UX Design', description: 'User interface and experience design' },
                { key: 'api-development', label: 'API Development', description: 'REST and GraphQL APIs' },
                { key: 'ecommerce', label: 'E-Commerce', description: 'Online store development' },
                { key: 'cms', label: 'CMS', description: 'Content management systems' },
                { key: 'devops', label: 'DevOps', description: 'Infrastructure and CI/CD' },
                { key: 'consulting', label: 'Consulting', description: 'Technical consulting and architecture review' },
                { key: 'other', label: 'Other', description: 'Other project types' },
            ],
            description: 'Available project request categories',
        },
    });

    console.log('  ✅ Categories seeded');
}
