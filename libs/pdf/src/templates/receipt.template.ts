export function getReceiptTemplate(data: Record<string, unknown>): string {
  const company = (data.company as Record<string, string>) || {};
  const client = (data.client as Record<string, string>) || {};
  const receiptNumber = data.receiptNumber || 'RCT-000';
  const receiptDate = data.receiptDate || new Date().toISOString().split('T')[0];
  const amountPaise = Number(data.amountPaise || 0);
  const currency = (data.currency as string) || 'INR';
  const paymentMethod = (data.paymentMethod as string) || 'Online';
  const transactionId = (data.transactionId as string) || '';

  const formatMoney = (paise: number) => `${currency} ${(paise / 100).toFixed(2)}`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { margin: 0; color: #7c3aed; font-size: 24px; }
    .header h2 { margin: 5px 0 0; color: #7c3aed; font-size: 28px; text-transform: uppercase; }
    .success-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
    .details { max-width: 500px; margin: 0 auto; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
    .detail-label { color: #666; font-size: 13px; }
    .detail-value { font-weight: 600; font-size: 13px; }
    .amount-row { font-size: 20px; color: #7c3aed; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${company.name || 'Nestlancer'}</h1>
    <h2>Payment Receipt</h2>
    <div class="success-badge">✓ Payment Successful</div>
  </div>

  <div class="details">
    <div class="detail-row">
      <span class="detail-label">Receipt Number</span>
      <span class="detail-value">${receiptNumber}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Date</span>
      <span class="detail-value">${receiptDate}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Received From</span>
      <span class="detail-value">${client.name || ''}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Email</span>
      <span class="detail-value">${client.email || ''}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Payment Method</span>
      <span class="detail-value">${paymentMethod}</span>
    </div>
    ${
      transactionId
        ? `
    <div class="detail-row">
      <span class="detail-label">Transaction ID</span>
      <span class="detail-value">${transactionId}</span>
    </div>`
        : ''
    }
    ${
      data.projectTitle
        ? `
    <div class="detail-row">
      <span class="detail-label">For Project</span>
      <span class="detail-value">${data.projectTitle}</span>
    </div>`
        : ''
    }
    <div class="detail-row amount-row">
      <span class="detail-label" style="font-size: 16px;">Amount Paid</span>
      <span class="detail-value">${formatMoney(amountPaise)}</span>
    </div>
  </div>

  <div class="footer">
    <p>${data.notes || 'Thank you for your payment!'}</p>
    <p>${company.address || ''}</p>
  </div>
</body>
</html>`;
}
