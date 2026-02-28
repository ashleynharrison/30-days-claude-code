import { getMenuPerformance } from '../database.js';

export function menuPerformance(args: {
  date_from?: string;
  date_to?: string;
  category?: string;
  sort_by?: 'revenue' | 'quantity' | 'margin';
  limit?: number;
}): string {
  const results = getMenuPerformance({
    ...args,
    limit: args.limit || 15,
  });

  if (results.length === 0) {
    return 'No order data found for the given criteria.';
  }

  const lines = results.map((item: any, i: number) => {
    return [
      `${i + 1}. ${item.name} (${item.category})`,
      `   Sold: ${item.total_qty} | Revenue: $${item.total_revenue} | Profit: $${item.total_profit}`,
      `   Price: $${item.price} | Cost: $${item.cost} | Margin: ${item.margin_pct}%`,
      `   Appeared in ${item.order_count} orders`,
    ].join('\n');
  });

  const totalRevenue = results.reduce((sum: number, r: any) => sum + r.total_revenue, 0);
  const totalProfit = results.reduce((sum: number, r: any) => sum + r.total_profit, 0);
  const totalQty = results.reduce((sum: number, r: any) => sum + r.total_qty, 0);

  return [
    `Menu Performance (${results.length} items):`,
    `Total: ${totalQty} items sold | $${totalRevenue.toFixed(2)} revenue | $${totalProfit.toFixed(2)} profit`,
    '',
    lines.join('\n\n'),
  ].join('\n');
}
