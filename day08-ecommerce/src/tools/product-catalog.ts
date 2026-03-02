import { searchProducts } from '../database.js';

export function productCatalog(args: {
  name?: string;
  category?: string;
  status?: string;
  low_stock?: boolean;
}): string {
  const products = searchProducts(args);

  if (products.length === 0) {
    return 'No products found matching those criteria.';
  }

  const output: string[] = [`═══ PRODUCT CATALOG (${products.length} product${products.length !== 1 ? 's' : ''}) ═══`, ''];

  products.forEach((p: any) => {
    const margin = Math.round(((p.price - p.cost) / p.price) * 100);
    let stockIcon = '🟢';
    if (p.stock_quantity === 0) stockIcon = '🔴';
    else if (p.stock_quantity <= p.reorder_point) stockIcon = '🟡';

    const statusLabel = p.status !== 'active' ? ` [${p.status.toUpperCase()}]` : '';

    output.push(`${stockIcon} ${p.name}${statusLabel}`);
    output.push(`   SKU: ${p.sku} | Category: ${p.category}`);
    output.push(`   Price: $${p.price.toFixed(2)} | Cost: $${p.cost.toFixed(2)} | Margin: ${margin}%`);
    output.push(`   Stock: ${p.stock_quantity} units (reorder at ${p.reorder_point})`);
    output.push(`   Sold: ${p.total_sold} units | Revenue: $${p.total_revenue.toFixed(2)}`);

    if (p.stock_quantity === 0) {
      output.push(`   ⚠️ OUT OF STOCK — needs immediate reorder`);
    } else if (p.stock_quantity <= p.reorder_point) {
      output.push(`   ⚠️ LOW STOCK — ${p.stock_quantity} remaining (reorder point: ${p.reorder_point})`);
    }

    output.push('');
  });

  return output.join('\n');
}
