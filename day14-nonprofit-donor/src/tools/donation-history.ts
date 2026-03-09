import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerDonationHistory(server: McpServer) {
  server.tool(
    'donation_history',
    'View donation records with filters for donor, campaign, date range, amount, and payment method. Includes totals and averages.',
    {
      donor_name: z.string().optional().describe('Filter by donor name (partial match)'),
      campaign_name: z.string().optional().describe('Filter by campaign name (partial match)'),
      date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
      min_amount: z.number().optional().describe('Minimum donation amount'),
      recurring_only: z.boolean().optional().describe('Show only recurring donations'),
    },
    async ({ donor_name, campaign_name, date_from, date_to, min_amount, recurring_only }) => {
      let query = `
        SELECT d.*, don.name as donor_name, don.type as donor_type,
               c.name as campaign_name
        FROM donations d
        JOIN donors don ON don.id = d.donor_id
        LEFT JOIN campaigns c ON c.id = d.campaign_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (donor_name) {
        query += ` AND don.name LIKE ?`;
        params.push(`%${donor_name}%`);
      }
      if (campaign_name) {
        query += ` AND c.name LIKE ?`;
        params.push(`%${campaign_name}%`);
      }
      if (date_from) {
        query += ` AND d.date >= ?`;
        params.push(date_from);
      }
      if (date_to) {
        query += ` AND d.date <= ?`;
        params.push(date_to);
      }
      if (min_amount) {
        query += ` AND d.amount >= ?`;
        params.push(min_amount);
      }
      if (recurring_only) {
        query += ` AND d.is_recurring = 1`;
      }

      query += ` ORDER BY d.date DESC`;

      const donations = db.prepare(query).all(...params) as any[];

      if (donations.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No donations found matching your criteria.' }] };
      }

      const total = donations.reduce((sum, d) => sum + d.amount, 0);
      const avg = total / donations.length;

      const result = {
        donations: donations.map((d) => ({
          donor: d.donor_name,
          donor_type: d.donor_type,
          amount: d.amount,
          date: d.date,
          campaign: d.campaign_name,
          designation: d.designation,
          payment_method: d.payment_method,
          recurring: !!d.is_recurring,
          notes: d.notes,
        })),
        summary: {
          total_donations: donations.length,
          total_amount: total,
          average_gift: Math.round(avg * 100) / 100,
          largest_gift: Math.max(...donations.map((d) => d.amount)),
          unique_donors: new Set(donations.map((d) => d.donor_id)).size,
        },
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
