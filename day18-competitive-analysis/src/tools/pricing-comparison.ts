import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerPricingComparison(server: McpServer) {
  server.tool(
    'pricing_comparison',
    'Compare pricing across competitors. Shows tiers, monthly/annual prices, billing models, and key limits. Filter by tier level or billing model.',
    {
      competitor: z.string().optional().describe('Filter by competitor name (partial match)'),
      tier: z.string().optional().describe('Filter by tier name (e.g. Pro, Enterprise, Free)'),
      billing_model: z.enum(['per_seat', 'flat_rate', 'free', 'custom']).optional().describe('Filter by billing model'),
    },
    async ({ competitor, tier, billing_model }) => {
      let query = `
        SELECT p.*, c.name as competitor_name
        FROM pricing p
        JOIN competitors c ON p.competitor_id = c.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (competitor) {
        query += ` AND c.name LIKE ?`;
        params.push(`%${competitor}%`);
      }
      if (tier) {
        query += ` AND p.tier_name LIKE ?`;
        params.push(`%${tier}%`);
      }
      if (billing_model) {
        query += ` AND p.billing_model = ?`;
        params.push(billing_model);
      }

      query += ` ORDER BY c.name, COALESCE(p.price_monthly, 999999)`;

      const pricing = db.prepare(query).all(...params) as any[];

      if (pricing.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No pricing data found matching your criteria.' }] };
      }

      // Group by competitor
      const grouped: Record<string, any[]> = {};
      for (const p of pricing) {
        if (!grouped[p.competitor_name]) grouped[p.competitor_name] = [];
        grouped[p.competitor_name].push({
          tier: p.tier_name,
          monthly: p.price_monthly !== null ? `$${p.price_monthly}` : 'Custom',
          annual: p.price_annual !== null ? `$${p.price_annual}` : 'Custom',
          billing_model: p.billing_model,
          key_limits: p.key_limits,
          notes: p.notes,
          as_of: p.recorded_date,
        });
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ pricing_by_competitor: grouped, total_tiers: pricing.length }, null, 2) }],
      };
    }
  );
}
