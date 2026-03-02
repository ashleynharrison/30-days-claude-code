import { getInventoryAlerts } from '../database.js';

export function inventoryAlerts(): string {
  const data = getInventoryAlerts();
  const output: string[] = ['═══ INVENTORY ALERTS ═══', ''];

  // Out of stock
  output.push('── Out of Stock ──');
  if (data.outOfStock.length > 0) {
    data.outOfStock.forEach((p: any) => {
      output.push(`  🔴 ${p.name} (${p.sku}) — 0 units. Reorder point: ${p.reorder_point}`);
    });
  } else {
    output.push('  None — all products in stock.');
  }
  output.push('');

  // Low stock
  output.push('── Low Stock (at or below reorder point) ──');
  if (data.lowStock.length > 0) {
    data.lowStock.forEach((p: any) => {
      const urgency = p.stock_quantity <= Math.floor(p.reorder_point / 2) ? '🔴' : '🟡';
      output.push(`  ${urgency} ${p.name} (${p.sku}) — ${p.stock_quantity} units remaining (reorder at ${p.reorder_point})`);
    });
  } else {
    output.push('  None — all active products above reorder point.');
  }
  output.push('');

  // Overstocked
  output.push('── Overstocked (5x+ reorder point) ──');
  if (data.overstocked.length > 0) {
    data.overstocked.forEach((p: any) => {
      output.push(`  📦 ${p.name} (${p.sku}) — ${p.stock_quantity} units (reorder point: ${p.reorder_point}, excess: ${p.excess_units})`);
    });
  } else {
    output.push('  None.');
  }
  output.push('');

  // Pending fulfillment
  output.push('── Pending Fulfillment ──');
  output.push(`  ${data.pendingFulfillment} orders awaiting processing/shipment`);

  return output.join('\n');
}
