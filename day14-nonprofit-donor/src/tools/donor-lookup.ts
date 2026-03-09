import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerDonorLookup(server: McpServer) {
  server.tool(
    'donor_lookup',
    'Search donors by name, type, giving level, or status. Returns contact info, giving history, and engagement summary.',
    {
      search: z.string().optional().describe('Search by donor name (partial match)'),
      type: z.enum(['individual', 'corporate', 'foundation']).optional().describe('Filter by donor type'),
      giving_level: z.enum(['general', 'mid_level', 'major', 'leadership']).optional().describe('Filter by giving level'),
      status: z.enum(['active', 'lapsed']).optional().describe('Filter by donor status'),
    },
    async ({ search, type, giving_level, status }) => {
      let query = `SELECT * FROM donors WHERE 1=1`;
      const params: any[] = [];

      if (search) {
        query += ` AND name LIKE ?`;
        params.push(`%${search}%`);
      }
      if (type) {
        query += ` AND type = ?`;
        params.push(type);
      }
      if (giving_level) {
        query += ` AND giving_level = ?`;
        params.push(giving_level);
      }
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      query += ` ORDER BY total_given DESC`;

      const donors = db.prepare(query).all(...params) as any[];

      if (donors.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No donors found matching your criteria.' }] };
      }

      const result = donors.map((d) => {
        const lastGift = db.prepare(
          `SELECT amount, date, designation FROM donations WHERE donor_id = ? ORDER BY date DESC LIMIT 1`
        ).get(d.id) as any;

        const lastEngagement = db.prepare(
          `SELECT type, date, subject FROM engagements WHERE donor_id = ? ORDER BY date DESC LIMIT 1`
        ).get(d.id) as any;

        const activePledges = db.prepare(
          `SELECT SUM(amount) as total, SUM(amount_paid) as paid FROM pledges WHERE donor_id = ? AND status IN ('active', 'overdue')`
        ).get(d.id) as any;

        return {
          name: d.name,
          email: d.email,
          phone: d.phone,
          type: d.type,
          giving_level: d.giving_level,
          status: d.status,
          lifetime_giving: d.total_given,
          largest_gift: d.largest_gift,
          total_gifts: d.gift_count,
          first_gift: d.first_gift_date,
          last_gift: lastGift ? { amount: lastGift.amount, date: lastGift.date, designation: lastGift.designation } : null,
          last_engagement: lastEngagement ? { type: lastEngagement.type, date: lastEngagement.date, subject: lastEngagement.subject } : null,
          outstanding_pledges: activePledges?.total ? { total: activePledges.total, paid: activePledges.paid, remaining: activePledges.total - activePledges.paid } : null,
          notes: d.notes,
        };
      });

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ donors: result, count: result.length }, null, 2) }],
      };
    }
  );
}
