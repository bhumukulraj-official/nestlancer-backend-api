import { PrismaClient } from '@prisma/client';

/**
 * Seed email templates using the EmailTemplate model.
 * Templates use Handlebars syntax with variables like {{userName}}, {{link}}.
 * Actual rendering is done by @nestlancer/mail template engine.
 */
export async function seedEmailTemplates(prisma: PrismaClient): Promise<void> {
  console.log('  📧 Seeding email templates...');

  const templates = [
    {
      name: 'verification',
      subject: 'Verify your Nestlancer account',
      body: '<h1>Welcome to Nestlancer, {{userName}}!</h1><p>Please verify your email by clicking the link below:</p><p><a href="{{link}}">Verify Email</a></p><p>This link expires in 24 hours.</p><p>If you did not create an account, please ignore this email.</p>',
      variables: { required: ['userName', 'link'], optional: [] },
      description: 'Email verification template sent after registration',
    },
    {
      name: 'welcome',
      subject: 'Welcome to Nestlancer!',
      body: '<h1>Welcome, {{userName}}! 🎉</h1><p>Your account is verified and ready to use.</p><p><a href="{{dashboardLink}}">Go to Dashboard</a></p>',
      variables: { required: ['userName', 'dashboardLink'], optional: [] },
      description: 'Welcome email sent after email verification',
    },
    {
      name: 'password-reset',
      subject: 'Reset your Nestlancer password',
      body: '<h1>Password Reset Request</h1><p>Hi {{userName}}, click below to reset your password:</p><p><a href="{{link}}">Reset Password</a></p><p>This link expires in 1 hour. If you didn\'t request this, ignore this email.</p>',
      variables: { required: ['userName', 'link'], optional: [] },
      description: 'Password reset email template',
    },
    {
      name: 'quote-sent',
      subject: 'New quote for your project: {{projectTitle}}',
      body: '<h1>Quote Ready</h1><p>Hi {{userName}}, a quote has been prepared for "{{projectTitle}}".</p><p>Total: ₹{{amount}}</p><p><a href="{{link}}">View Quote</a></p><p>Valid until {{validUntil}}.</p>',
      variables: {
        required: ['userName', 'projectTitle', 'amount', 'link', 'validUntil'],
        optional: [],
      },
      description: 'Quote sent notification email',
    },
    {
      name: 'payment-receipt',
      subject: 'Payment receipt for {{projectTitle}}',
      body: '<h1>Payment Received</h1><p>Hi {{userName}}, we received your payment of ₹{{amount}} for "{{projectTitle}}".</p><p>Receipt: {{receiptNumber}}</p><p><a href="{{receiptLink}}">Download Receipt</a></p>',
      variables: {
        required: ['userName', 'projectTitle', 'amount', 'receiptNumber', 'receiptLink'],
        optional: [],
      },
      description: 'Payment receipt email template',
    },
    {
      name: 'project-update',
      subject: 'Update on your project: {{projectTitle}}',
      body: '<h1>Project Update</h1><p>Hi {{userName}}, there\'s a new update on "{{projectTitle}}":</p><p>{{updateMessage}}</p><p><a href="{{link}}">View Progress</a></p>',
      variables: { required: ['userName', 'projectTitle', 'updateMessage', 'link'], optional: [] },
      description: 'Project progress update email',
    },
    {
      name: 'milestone-completed',
      subject: 'Milestone completed: {{milestoneName}}',
      body: '<h1>Milestone Completed 🎯</h1><p>Hi {{userName}}, milestone "{{milestoneName}}" for project "{{projectTitle}}" has been completed.</p><p><a href="{{link}}">View Project</a></p>',
      variables: { required: ['userName', 'milestoneName', 'projectTitle', 'link'], optional: [] },
      description: 'Milestone completion notification email',
    },
    {
      name: 'new-message',
      subject: 'New message in {{projectTitle}}',
      body: '<h1>New Message</h1><p>Hi {{userName}}, {{senderName}} sent you a message in project "{{projectTitle}}".</p><p><a href="{{link}}">View Message</a></p>',
      variables: { required: ['userName', 'senderName', 'projectTitle', 'link'], optional: [] },
      description: 'New message notification email',
    },
    {
      name: 'account-suspended',
      subject: 'Your Nestlancer account has been suspended',
      body: '<h1>Account Suspended</h1><p>Hi {{userName}}, your account has been suspended.</p><p>Reason: {{reason}}</p><p>If you believe this is an error, please contact support.</p>',
      variables: { required: ['userName', 'reason'], optional: [] },
      description: 'Account suspension notification email',
    },
    {
      name: 'contact-received',
      subject: 'We received your message – Ticket #{{ticketId}}',
      body: '<h1>Message Received</h1><p>Hi {{name}}, thank you for contacting us.</p><p>Your ticket ID is <strong>{{ticketId}}</strong>. We will respond within 24–48 hours.</p>',
      variables: { required: ['name', 'ticketId'], optional: [] },
      description: 'Contact form submission acknowledgment email',
    },
  ];

  for (const template of templates) {
    await prisma.emailTemplate.upsert({
      where: { name: template.name },
      update: {},
      create: template,
    });
  }

  console.log('  ✅ Email templates seeded');
}
