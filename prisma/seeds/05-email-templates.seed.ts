import { PrismaClient } from '../../generated';

/**
 * Seed email templates stored in SystemConfig.
 * Templates use Handlebars syntax with variables like {{userName}}, {{link}}.
 * Actual rendering is done by @nestlancer/mail template engine.
 */
export async function seedEmailTemplates(prisma: PrismaClient): Promise<void> {
    console.log('  📧 Seeding email templates...');

    const templates = [
        {
            key: 'email.template.verification',
            value: {
                name: 'verification',
                subject: 'Verify your Nestlancer account',
                html: '<h1>Welcome to Nestlancer, {{userName}}!</h1><p>Please verify your email by clicking the link below:</p><p><a href="{{link}}">Verify Email</a></p><p>This link expires in 24 hours.</p><p>If you did not create an account, please ignore this email.</p>',
                text: 'Welcome to Nestlancer, {{userName}}! Verify your email: {{link}} (expires in 24 hours)',
                variables: ['userName', 'link'],
            },
            description: 'Email verification template',
        },
        {
            key: 'email.template.welcome',
            value: {
                name: 'welcome',
                subject: 'Welcome to Nestlancer!',
                html: '<h1>Welcome, {{userName}}! 🎉</h1><p>Your account is verified and ready to use.</p><p><a href="{{dashboardLink}}">Go to Dashboard</a></p>',
                text: 'Welcome, {{userName}}! Your account is ready. Visit: {{dashboardLink}}',
                variables: ['userName', 'dashboardLink'],
            },
            description: 'Welcome email after verification',
        },
        {
            key: 'email.template.password-reset',
            value: {
                name: 'password-reset',
                subject: 'Reset your Nestlancer password',
                html: '<h1>Password Reset Request</h1><p>Hi {{userName}}, click below to reset your password:</p><p><a href="{{link}}">Reset Password</a></p><p>This link expires in 1 hour. If you didn\'t request this, ignore this email.</p>',
                text: 'Hi {{userName}}, reset your password: {{link}} (expires in 1 hour)',
                variables: ['userName', 'link'],
            },
            description: 'Password reset email template',
        },
        {
            key: 'email.template.quote-sent',
            value: {
                name: 'quote-sent',
                subject: 'New quote for your project: {{projectTitle}}',
                html: '<h1>Quote Ready</h1><p>Hi {{userName}}, a quote has been prepared for "{{projectTitle}}".</p><p>Total: ₹{{amount}}</p><p><a href="{{link}}">View Quote</a></p><p>Valid until {{validUntil}}.</p>',
                text: 'Hi {{userName}}, your quote for "{{projectTitle}}" is ready. Total: ₹{{amount}}. View: {{link}}',
                variables: ['userName', 'projectTitle', 'amount', 'link', 'validUntil'],
            },
            description: 'Quote sent notification email',
        },
        {
            key: 'email.template.payment-receipt',
            value: {
                name: 'payment-receipt',
                subject: 'Payment receipt for {{projectTitle}}',
                html: '<h1>Payment Received</h1><p>Hi {{userName}}, we received your payment of ₹{{amount}} for "{{projectTitle}}".</p><p>Receipt: {{receiptNumber}}</p><p><a href="{{receiptLink}}">Download Receipt</a></p>',
                text: 'Hi {{userName}}, payment of ₹{{amount}} received for "{{projectTitle}}". Receipt: {{receiptNumber}}',
                variables: ['userName', 'projectTitle', 'amount', 'receiptNumber', 'receiptLink'],
            },
            description: 'Payment receipt email template',
        },
        {
            key: 'email.template.project-update',
            value: {
                name: 'project-update',
                subject: 'Update on your project: {{projectTitle}}',
                html: '<h1>Project Update</h1><p>Hi {{userName}}, there\'s a new update on "{{projectTitle}}":</p><p>{{updateMessage}}</p><p><a href="{{link}}">View Progress</a></p>',
                text: 'Hi {{userName}}, update on "{{projectTitle}}": {{updateMessage}}. View: {{link}}',
                variables: ['userName', 'projectTitle', 'updateMessage', 'link'],
            },
            description: 'Project progress update email',
        },
    ];

    for (const template of templates) {
        await prisma.systemConfig.upsert({
            where: { key: template.key },
            update: {},
            create: {
                key: template.key,
                value: template.value,
                description: template.description,
            },
        });
    }

    console.log('  ✅ Email templates seeded');
}
