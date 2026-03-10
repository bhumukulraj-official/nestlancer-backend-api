import { PrismaClient } from '@prisma/client';

/**
 * Seed test portfolio items for development.
 */
export async function seedTestPortfolio(prisma: PrismaClient): Promise<void> {
  console.log('    🎨 Seeding test portfolio items...');

  // Get or create portfolio categories
  const webDevCategory = await prisma.portfolioCategory.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: { name: 'Web Development', slug: 'web-development' },
  });

  const mobileCategory = await prisma.portfolioCategory.upsert({
    where: { slug: 'mobile-app' },
    update: {},
    create: { name: 'Mobile App', slug: 'mobile-app' },
  });

  const items = [
    {
      title: 'HealthTech Dashboard',
      slug: 'healthtech-dashboard',
      shortDescription: 'Real-time patient monitoring dashboard for hospitals.',
      fullDescription:
        'Built a comprehensive healthcare analytics platform with real-time vitals monitoring, appointment scheduling, and HIPAA-compliant data storage. Used Next.js, NestJS, and PostgreSQL with WebSocket for live updates.',
      contentFormat: 'markdown',
      categoryId: webDevCategory.id,
      tags: ['React', 'NestJS', 'PostgreSQL', 'WebSocket', 'Healthcare'],
      status: 'PUBLISHED' as const,
      featured: true,
      clientName: 'MedCorp India',
      clientIndustry: 'Healthcare',
      clientWebsite: 'https://medcorp.example.com',
      clientTestimonial: {
        quote: 'Exceptional quality and attention to detail. Delivered ahead of schedule.',
        author: 'CTO, MedCorp India',
      },
      stats: { users: '500+ doctors', uptime: '99.9%', loadTime: '<2s' },
      projectDetails: {
        duration: '4 months',
        teamSize: 3,
        technologies: ['Next.js', 'NestJS', 'PostgreSQL', 'Redis', 'Docker'],
      },
      links: {
        live: 'https://dashboard.medcorp.example.com',
        caseStudy: '/blog/healthtech-case-study',
      },
      seo: {
        title: 'HealthTech Dashboard - Portfolio | Nestlancer',
        description: 'Real-time healthcare analytics platform',
      },
      publishedAt: new Date(),
      completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'E-Commerce Mobile App',
      slug: 'ecommerce-mobile-app',
      shortDescription: 'Cross-platform shopping app with Razorpay integration.',
      fullDescription:
        'Developed a React Native e-commerce app with product catalog, cart, wishlists, and Razorpay payment gateway. Features include push notifications, order tracking, and offline mode.',
      contentFormat: 'markdown',
      categoryId: mobileCategory.id,
      tags: ['React Native', 'Node.js', 'Razorpay', 'TypeScript'],
      status: 'PUBLISHED' as const,
      featured: true,
      clientName: 'ShopEasy',
      clientIndustry: 'E-Commerce',
      projectDetails: {
        duration: '3 months',
        teamSize: 2,
        technologies: ['React Native', 'Node.js', 'MongoDB', 'Razorpay'],
      },
      seo: {
        title: 'E-Commerce Mobile App - Portfolio | Nestlancer',
        description: 'Cross-platform shopping app',
      },
      publishedAt: new Date(),
      completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'SaaS Analytics Platform',
      slug: 'saas-analytics-platform',
      shortDescription: 'Business intelligence platform with custom dashboards.',
      fullDescription:
        'Built a multi-tenant SaaS analytics platform with customizable dashboards, data visualization, and automated reporting. Processes millions of events daily.',
      contentFormat: 'markdown',
      categoryId: webDevCategory.id,
      tags: ['Vue.js', 'Python', 'PostgreSQL', 'Redis', 'Analytics'],
      status: 'DRAFT' as const,
      featured: false,
      projectDetails: {
        duration: '6 months',
        teamSize: 4,
        technologies: ['Vue.js', 'FastAPI', 'PostgreSQL', 'Redis', 'ClickHouse'],
      },
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
