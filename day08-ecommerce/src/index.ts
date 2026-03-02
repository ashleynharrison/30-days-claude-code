import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { productCatalog } from './tools/product-catalog.js';
import { orderLookup } from './tools/order-lookup.js';
import { customerInsights } from './tools/customer-insights.js';
import { inventoryAlerts } from './tools/inventory-alerts.js';
import { salesAnalytics } from './tools/sales-analytics.js';
import { fulfillmentQueue } from './tools/fulfillment-queue.js';

const server = new McpServer({
  name: 'ecommerce-inventory-orders',
  version: '1.0.0',
});

// Tool 1: Product Catalog
server.tool(
  'product_catalog',
  'Search and view products — pricing, margins, stock levels, and sales performance. Filter by name, category, status, or flag low-stock items.',
  {
    name: z.string().optional().describe('Search by product name (partial match)'),
    category: z.enum(['skincare', 'haircare', 'bodycare', 'fragrance', 'sets', 'tools']).optional().describe('Filter by category'),
    status: z.enum(['active', 'discontinued', 'out_of_season', 'draft']).optional().describe('Filter by product status'),
    low_stock: z.boolean().optional().describe('Show only items at or below reorder point'),
  },
  async (args) => ({
    content: [{ type: 'text', text: productCatalog(args) }],
  })
);

// Tool 2: Order Lookup
server.tool(
  'order_lookup',
  'Search orders by number, status, customer name, or date range. Shows items, totals, tracking, and shipping details.',
  {
    order_number: z.string().optional().describe('Search by order number (partial match)'),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional().describe('Filter by order status'),
    customer_name: z.string().optional().describe('Search by customer name (partial match)'),
    date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
  },
  async (args) => ({
    content: [{ type: 'text', text: orderLookup(args) }],
  })
);

// Tool 3: Customer Insights
server.tool(
  'customer_insights',
  'View customer profiles — tier, order history, lifetime value, and days since last purchase. Filter by name, tier, or recent activity.',
  {
    name: z.string().optional().describe('Search by customer name (partial match)'),
    tier: z.enum(['standard', 'silver', 'gold', 'vip']).optional().describe('Filter by customer tier'),
    has_recent_order: z.boolean().optional().describe('Only show customers with orders in the last 30 days'),
  },
  async (args) => ({
    content: [{ type: 'text', text: customerInsights(args) }],
  })
);

// Tool 4: Inventory Alerts
server.tool(
  'inventory_alerts',
  'Real-time inventory health — out-of-stock items, low stock warnings, overstocked products, and pending fulfillment count.',
  {},
  async () => ({
    content: [{ type: 'text', text: inventoryAlerts() }],
  })
);

// Tool 5: Sales Analytics
server.tool(
  'sales_analytics',
  'Sales performance — total revenue, avg order value, top products by revenue/profit, revenue by category, and order status breakdown.',
  {
    date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
    category: z.enum(['skincare', 'haircare', 'bodycare', 'fragrance', 'sets', 'tools']).optional().describe('Filter analytics to a specific category'),
  },
  async (args) => ({
    content: [{ type: 'text', text: salesAnalytics(args) }],
  })
);

// Tool 6: Fulfillment Queue
server.tool(
  'fulfillment_queue',
  'Orders awaiting fulfillment — sorted by priority (express first), with items, customer info, and days since order. Flags overdue shipments.',
  {},
  async () => ({
    content: [{ type: 'text', text: fulfillmentQueue() }],
  })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
