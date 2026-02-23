import { registerAs } from '@nestjs/config';

export default registerAs('payments', () => ({
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mocksecret',
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'mockwebhooksecret',
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'USD',
    supportedCurrencies: (process.env.SUPPORTED_CURRENCIES || 'USD,EUR,GBP,INR').split(','),
    receiptPdfPrefix: process.env.RECEIPT_PDF_PREFIX || 'RCPT-',
    invoicePdfPrefix: process.env.INVOICE_PDF_PREFIX || 'INV-',
}));
