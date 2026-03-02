import { searchOrders } from '../database.js';

export function orderLookup(args: {
  order_number?: string;
  status?: string;
  customer_name?: string;
  date_from?: string;
  date_to?: string;
}): string {
  const orders = searchOrders(args);

  if (orders.length === 0) {
    return 'No orders found matching those criteria.';
  }

  const output: string[] = [`═══ ORDERS (${orders.length}) ═══`, ''];

  orders.forEach((o: any) => {
    const statusMap: Record<string, string> = {
      pending: '⏳', processing: '🔄', shipped: '📦', delivered: '✅', cancelled: '❌', refunded: '💰'
    };
    const statusIcon = statusMap[o.status] || '⚪';

    output.push(`${statusIcon} ${o.order_number} — ${o.customer_name}`);
    output.push(`   Date: ${o.order_date} | Status: ${o.status.toUpperCase()}`);
    output.push(`   Items (${o.item_count}): ${o.product_names}`);
    output.push(`   Subtotal: $${o.subtotal.toFixed(2)}${o.discount > 0 ? ` | Discount: -$${o.discount.toFixed(2)}` : ''} | Shipping: $${o.shipping.toFixed(2)} | Tax: $${o.tax.toFixed(2)}`);
    output.push(`   Total: $${o.total.toFixed(2)} | Method: ${o.shipping_method}`);

    if (o.tracking_number) {
      output.push(`   Tracking: ${o.tracking_number}`);
    }
    if (o.notes) {
      output.push(`   Notes: ${o.notes}`);
    }

    output.push('');
  });

  // Summary
  const totalRevenue = orders.filter((o: any) => !['cancelled', 'refunded'].includes(o.status)).reduce((sum: number, o: any) => sum + o.total, 0);
  output.push(`── Total revenue (excl. cancelled/refunded): $${totalRevenue.toFixed(2)} ──`);

  return output.join('\n');
}
