import { getSalesAnalytics } from '../database.js';

export function salesAnalytics(args: {
  date_from?: string;
  date_to?: string;
  category?: string;
}): string {
  const data = getSalesAnalytics(args);
  const output: string[] = ['═══ SALES ANALYTICS ═══', ''];

  // Overview
  const o = data.overview;
  output.push('── Overview ──');
  output.push(`  Total orders: ${o.total_orders}`);
  output.push(`  Total revenue: $${Number(o.total_revenue).toFixed(2)}`);
  output.push(`  Avg order value: $${Number(o.avg_order_value).toFixed(2)}`);
  output.push(`  Unique customers: ${o.unique_customers}`);
  output.push('');

  // By category
  if (data.byCategory.length > 0) {
    output.push('── Revenue by Category ──');
    data.byCategory.forEach((c: any) => {
      const bar = '█'.repeat(Math.max(1, Math.round((c.revenue / (data.byCategory[0]?.revenue || 1)) * 10)));
      output.push(`  ${c.category.padEnd(12)} ${bar} $${Number(c.revenue).toFixed(2)} (${c.units_sold} units, ${c.orders} orders)`);
    });
    output.push('');
  }

  // Top products
  if (data.topProducts.length > 0) {
    output.push('── Top Products by Revenue ──');
    data.topProducts.forEach((p: any, i: number) => {
      output.push(`  ${i + 1}. ${p.name} (${p.sku})`);
      output.push(`     ${p.units_sold} sold | $${Number(p.revenue).toFixed(2)} revenue | $${Number(p.profit).toFixed(2)} profit`);
    });
    output.push('');
  }

  // By status
  if (data.byStatus.length > 0) {
    output.push('── Orders by Status ──');
    data.byStatus.forEach((s: any) => {
      output.push(`  ${s.status.padEnd(12)} ${s.count} orders ($${Number(s.total).toFixed(2)})`);
    });
  }

  return output.join('\n');
}
