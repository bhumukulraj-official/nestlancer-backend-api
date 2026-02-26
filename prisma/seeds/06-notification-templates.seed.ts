import { PrismaClient } from '@prisma/client';

/**
 * Seed notification templates stored in SystemConfig.
 */
export async function seedNotificationTemplates(prisma: PrismaClient): Promise<void> {
    console.log('  🔔 Seeding notification templates...');

    await prisma.systemConfig.upsert({
        where: { key: 'notification.templates' },
        update: {},
        create: {
            key: 'notification.templates',
            value: [
                {
                    type: 'QUOTE_RECEIVED',
                    title: 'New Quote Received',
                    message: 'A quote has been sent for your request "{{requestTitle}}"',
                    channels: ['IN_APP', 'EMAIL'],
                    priority: 'HIGH',
                },
                {
                    type: 'QUOTE_ACCEPTED',
                    title: 'Quote Accepted',
                    message: 'Your quote for "{{projectTitle}}" has been accepted',
                    channels: ['IN_APP', 'EMAIL'],
                    priority: 'HIGH',
                },
                {
                    type: 'PAYMENT_RECEIVED',
                    title: 'Payment Received',
                    message: 'Payment of ₹{{amount}} received for "{{projectTitle}}"',
                    channels: ['IN_APP', 'EMAIL'],
                    priority: 'HIGH',
                },
                {
                    type: 'PROJECT_UPDATE',
                    title: 'Project Update',
                    message: 'New update on "{{projectTitle}}": {{updateTitle}}',
                    channels: ['IN_APP'],
                    priority: 'NORMAL',
                },
                {
                    type: 'MILESTONE_COMPLETED',
                    title: 'Milestone Completed',
                    message: 'Milestone "{{milestoneName}}" has been completed for "{{projectTitle}}"',
                    channels: ['IN_APP', 'EMAIL'],
                    priority: 'HIGH',
                },
                {
                    type: 'NEW_MESSAGE',
                    title: 'New Message',
                    message: '{{senderName}} sent a message in "{{projectTitle}}"',
                    channels: ['IN_APP', 'PUSH'],
                    priority: 'NORMAL',
                },
                {
                    type: 'DELIVERABLE_READY',
                    title: 'Deliverable Ready for Review',
                    message: 'A deliverable is ready for your review in "{{projectTitle}}"',
                    channels: ['IN_APP', 'EMAIL'],
                    priority: 'HIGH',
                },
                {
                    type: 'REQUEST_STATUS_CHANGED',
                    title: 'Request Status Updated',
                    message: 'Your request "{{requestTitle}}" status changed to {{newStatus}}',
                    channels: ['IN_APP'],
                    priority: 'NORMAL',
                },
                {
                    type: 'PROJECT_COMPLETED',
                    title: 'Project Completed',
                    message: 'Project "{{projectTitle}}" has been marked as completed! 🎉',
                    channels: ['IN_APP', 'EMAIL'],
                    priority: 'HIGH',
                },
            ],
            description: 'Notification template definitions with channel routing',
        },
    });

    console.log('  ✅ Notification templates seeded');
}
