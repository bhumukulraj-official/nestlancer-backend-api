import { PrismaClient } from '@prisma/client';

/**
 * Seed test projects with milestones and deliverables for development.
 */
export async function seedTestProjects(prisma: PrismaClient): Promise<void> {
  console.log('    📁 Seeding test projects...');

  // Create a test request
  const request = await prisma.projectRequest.upsert({
    where: { id: 'test-request-001' },
    update: {},
    create: {
      id: 'test-request-001',
      userId: 'test-user-001',
      title: 'E-Commerce Platform Development',
      description: 'Build a full-featured e-commerce platform with payment integration.',
      category: 'web-development',
      budgetMin: 5000000,
      budgetMax: 10000000,
      timeframe: '3 months',
      status: 'CONVERTED_TO_PROJECT',
    },
  });

  // Create a test quote
  const quote = await prisma.quote.upsert({
    where: { requestId: request.id },
    update: {},
    create: {
      id: 'test-quote-001',
      requestId: request.id,
      userId: 'test-user-001',
      title: 'E-Commerce Platform - Proposal',
      description: 'Full-stack e-commerce with Next.js, NestJS, and PostgreSQL.',
      totalAmount: 7500000,
      currency: 'INR',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'ACCEPTED',
      acceptedAt: new Date(),
      paymentBreakdown: { upfront: 30, milestones: 50, final: 20 },
    },
  });

  // Create a test project
  const project = await prisma.project.upsert({
    where: { quoteId: quote.id },
    update: {},
    create: {
      id: 'test-project-001',
      quoteId: quote.id,
      clientId: 'test-user-001',
      adminId: 'test-admin-001',
      title: 'E-Commerce Platform',
      description: 'Full-featured e-commerce platform.',
      status: 'IN_PROGRESS',
      overallProgress: 35,
      startDate: new Date(),
      targetEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  // Link quote to project
  await prisma.quote.update({
    where: { id: quote.id },
    data: { projectId: project.id },
  });

  // Create milestones
  const milestones = [
    {
      id: 'test-milestone-001',
      projectId: project.id,
      name: 'Design & Architecture',
      description: 'UI/UX design and system architecture.',
      amount: 2250000,
      percentage: 30,
      status: 'COMPLETED' as const,
      progress: 100,
      order: 1,
      completedAt: new Date(),
    },
    {
      id: 'test-milestone-002',
      projectId: project.id,
      name: 'Core Development',
      description: 'Backend API, frontend components, database.',
      amount: 3750000,
      percentage: 50,
      status: 'IN_PROGRESS' as const,
      progress: 40,
      order: 2,
    },
    {
      id: 'test-milestone-003',
      projectId: project.id,
      name: 'Testing & Launch',
      description: 'QA, performance testing, and deployment.',
      amount: 1500000,
      percentage: 20,
      status: 'PENDING' as const,
      progress: 0,
      order: 3,
    },
  ];

  for (const milestone of milestones) {
    await prisma.milestone.upsert({
      where: { id: milestone.id },
      update: {},
      create: milestone,
    });
  }

  // Create deliverables for milestone 1
  const deliverables = [
    {
      id: 'test-deliverable-001',
      milestoneId: 'test-milestone-001',
      name: 'UI/UX Wireframes',
      description: 'Complete wireframes for all pages.',
      status: 'APPROVED' as const,
      priority: 'HIGH',
      approvedAt: new Date(),
    },
    {
      id: 'test-deliverable-002',
      milestoneId: 'test-milestone-001',
      name: 'System Architecture Document',
      description: 'Technical architecture and database design.',
      status: 'APPROVED' as const,
      priority: 'HIGH',
      approvedAt: new Date(),
    },
    {
      id: 'test-deliverable-003',
      milestoneId: 'test-milestone-002',
      name: 'Backend API Implementation',
      description: 'RESTful API with authentication and authorization.',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH',
    },
  ];

  for (const deliverable of deliverables) {
    await prisma.deliverable.upsert({
      where: { id: deliverable.id },
      update: {},
      create: deliverable,
    });
  }

  // Create a test payment
  await prisma.payment.upsert({
    where: { id: 'test-payment-001' },
    update: {},
    create: {
      id: 'test-payment-001',
      projectId: project.id,
      milestoneId: 'test-milestone-001',
      clientId: 'test-user-001',
      amount: 2250000,
      currency: 'INR',
      status: 'COMPLETED',
      method: 'UPI',
      externalId: 'pay_test_001',
      paidAt: new Date(),
      receiptNumber: 'REC-2026-0001',
    },
  });

  // Create a progress entry
  await prisma.progressEntry.upsert({
    where: { id: 'test-progress-001' },
    update: {},
    create: {
      id: 'test-progress-001',
      projectId: project.id,
      milestoneId: 'test-milestone-001',
      type: 'MILESTONE_COMPLETED',
      title: 'Design & Architecture phase completed',
      description: 'All wireframes and architecture documents have been approved.',
      actorId: 'test-admin-001',
      visibility: 'client',
      clientNotified: true,
    },
  });

  // Create a test message
  await prisma.message.upsert({
    where: { id: 'test-message-001' },
    update: {},
    create: {
      id: 'test-message-001',
      projectId: project.id,
      senderId: 'test-admin-001',
      content: 'Hi! The design phase is complete. Moving on to development.',
      type: 'TEXT',
    },
  });

  // Create a second request (draft)
  await prisma.projectRequest.upsert({
    where: { id: 'test-request-002' },
    update: {},
    create: {
      id: 'test-request-002',
      userId: 'test-user-002',
      title: 'Corporate Website Redesign',
      description: 'Modernize our company website with a fresh design and improved UX.',
      category: 'ui-ux-design',
      budgetMin: 2000000,
      budgetMax: 4000000,
      timeframe: '6 weeks',
      status: 'SUBMITTED',
    },
  });

  console.log('    ✅ Test projects seeded');
}
