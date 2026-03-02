import { getFulfillmentQueue } from '../database.js';

export function fulfillmentQueue(): string {
  const orders = getFulfillmentQueue();

  if (orders.length === 0) {
    return 'No orders awaiting fulfillment. All caught up! 🎉';
  }

  const output: string[] = [`═══ FULFILLMENT QUEUE (${orders.length} order${orders.length !== 1 ? 's' : ''}) ═══`, ''];

  // Express first
  const express = orders.filter((o: any) => o.shipping_method === 'express');
  const standard = orders.filter((o: any) => o.shipping_method === 'standard');
  const other = orders.filter((o: any) => !['express', 'standard'].includes(o.shipping_method));

  if (express.length > 0) {
    output.push('── 🚀 EXPRESS (ship today) ──');
    express.forEach((o: any) => {
      const urgency = o.days_since_order >= 2 ? '🔴' : '🟡';
      output.push(`  ${urgency} ${o.order_number} — ${o.customer_name} (${o.customer_email})`);
      output.push(`     Status: ${o.status} | Ordered: ${o.order_date} (${o.days_since_order}d ago)`);
      output.push(`     Items: ${o.items_summary}`);
      output.push(`     Total: $${o.total.toFixed(2)}`);
      if (o.notes) output.push(`     Notes: ${o.notes}`);
      output.push('');
    });
  }

  if (standard.length > 0) {
    output.push('── 📦 STANDARD ──');
    standard.forEach((o: any) => {
      const urgency = o.days_since_order >= 3 ? '🔴' : o.days_since_order >= 2 ? '🟡' : '🟢';
      output.push(`  ${urgency} ${o.order_number} — ${o.customer_name} (${o.customer_email})`);
      output.push(`     Status: ${o.status} | Ordered: ${o.order_date} (${o.days_since_order}d ago)`);
      output.push(`     Items: ${o.items_summary}`);
      output.push(`     Total: $${o.total.toFixed(2)}`);
      if (o.notes) output.push(`     Notes: ${o.notes}`);
      output.push('');
    });
  }

  if (other.length > 0) {
    output.push('── 📬 OTHER ──');
    other.forEach((o: any) => {
      output.push(`  ${o.order_number} — ${o.customer_name} | ${o.shipping_method}`);
      output.push(`     Items: ${o.items_summary}`);
      output.push(`     Total: $${o.total.toFixed(2)}`);
      output.push('');
    });
  }

  return output.join('\n');
}
