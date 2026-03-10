import { PrismaClient } from '@prisma/client';

/**
 * Seed default blog tags for content organization.
 */
export async function seedTags(prisma: PrismaClient): Promise<void> {
  console.log('  🏷️  Seeding tags...');

  // Blog tags
  const blogTags = [
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'JavaScript', slug: 'javascript' },
    { name: 'NestJS', slug: 'nestjs' },
    { name: 'React', slug: 'react' },
    { name: 'Next.js', slug: 'nextjs' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: 'PostgreSQL', slug: 'postgresql' },
    { name: 'Redis', slug: 'redis' },
    { name: 'Docker', slug: 'docker' },
    { name: 'DevOps', slug: 'devops' },
    { name: 'CI/CD', slug: 'ci-cd' },
    { name: 'Testing', slug: 'testing' },
    { name: 'Performance', slug: 'performance' },
    { name: 'Security', slug: 'security' },
    { name: 'Architecture', slug: 'architecture' },
    { name: 'Microservices', slug: 'microservices' },
    { name: 'API Design', slug: 'api-design' },
    { name: 'UI/UX', slug: 'ui-ux' },
    { name: 'Prisma', slug: 'prisma' },
    { name: 'GraphQL', slug: 'graphql' },
  ];

  for (const tag of blogTags) {
    await prisma.blogTag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  console.log('  ✅ Tags seeded');
}
