import { PrismaClient } from '../../generated';

/**
 * Seed default project request and portfolio categories.
 */
export async function seedCategories(prisma: PrismaClient): Promise<void> {
    console.log('  📂 Seeding categories...');

    // Blog categories
    const blogCategories = [
        { name: 'Technology', slug: 'technology', description: 'Tech articles and tutorials', displayOrder: 1 },
        { name: 'Design', slug: 'design', description: 'UI/UX design insights', displayOrder: 2 },
        { name: 'Business', slug: 'business', description: 'Business and freelancing tips', displayOrder: 3 },
        { name: 'Case Studies', slug: 'case-studies', description: 'Project case studies and retrospectives', displayOrder: 4 },
        { name: 'Tutorials', slug: 'tutorials', description: 'Step-by-step development tutorials', displayOrder: 5 },
        { name: 'Industry News', slug: 'industry-news', description: 'Latest industry updates', displayOrder: 6 },
    ];

    for (const category of blogCategories) {
        await prisma.blogCategory.upsert({
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
