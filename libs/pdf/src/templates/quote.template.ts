export function getQuoteTemplate(data: Record<string, unknown>): string {
  const company = (data.company as Record<string, string>) || {};
  const client = (data.client as Record<string, string>) || {};
  const items = (data.items as Array<Record<string, unknown>>) || [];
  const quoteNumber = data.quoteNumber || 'QTE-000';
  const quoteDate = data.quoteDate || new Date().toISOString().split('T')[0];
  const expiryDate = data.expiryDate || '';
  const totalPaise = Number(data.totalPaise || 0);
  const currency = (data.currency as string) || 'INR';

  const formatMoney = (paise: number) => `${currency} ${(paise / 100).toFixed(2)}`;

  const itemRows = items.map((item) => `
    <tr>
      <td>${item.description || ''}</td>
      <td style="text-align:center">${item.quantity || 1}</td>
      <td style="text-align:right">${formatMoney(Number(item.unitPricePaise || 0))}</td>
      <td style="text-align:right">${formatMoney(Number(item.totalPaise || 0))}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .company-info h1 { margin: 0; color: #059669; font-size: 24px; }
    .quote-meta { text-align: right; }
    .quote-meta h2 { margin: 0; color: #059669; font-size: 28px; text-transform: uppercase; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .party { width: 45%; }
    .party h3 { color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #059669; color: white; padding: 12px; text-align: left; font-size: 13px; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
    .totals { text-align: right; }
    .totals .total-row { font-size: 18px; font-weight: bold; color: #059669; }
    .validity { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin-top: 20px; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; }
    .terms { margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h1>${company.name || 'Nestlancer'}</h1>
      <p>${company.address || ''}</p>
      <p>${company.email || ''}</p>
    </div>
    <div class="quote-meta">
      <h2>Quote</h2>
      <p><strong>#${quoteNumber}</strong></p>
      <p>Date: ${quoteDate}</p>
      ${expiryDate ? `<p>Valid Until: ${expiryDate}</p>` : ''}
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Prepared For</h3>
      <p><strong>${client.name || ''}</strong></p>
      <p>${client.email || ''}</p>
      <p>${client.address || ''}</p>
    </div>
  </div>

  ${data.description ? `<div class="validity"><p>${data.description}</p></div>` : ''}

  <table style="margin-top: 20px;">
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals">
    ${data.subtotalPaise ? `<p>Subtotal: ${formatMoney(Number(data.subtotalPaise))}</p>` : ''}
    ${data.taxPaise ? `<p>Tax: ${formatMoney(Number(data.taxPaise))}</p>` : ''}
    <p class="total-row">Total: ${formatMoney(totalPaise)}</p>
  </div>

  ${data.terms ? `<div class="terms"><h4>Terms & Conditions</h4><p>${data.terms}</p></div>` : ''}

  <div class="footer">
    <p>${data.notes || 'This quote is valid for 30 days from the date of issue.'}</p>
  </div>
</body>
</html>`;
}
