import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerCampaignDashboard(server: McpServer) {
  server.tool(
    'campaign_dashboard',
    'View campaign performance — progress to goal, donor counts, top contributors, and recent donations for each campaign.',
    {
      campaign_name: z.string().optional().describe('Filter by campaign name (partial match)'),
      status: z.enum(['active', 'completed', 'planning']).optional().describe('Filter by campaign status'),
    },
    async ({ campaign_name, status }) => {
      let query = `SELECT * FROM campaigns WHERE 1=1`;
      const params: any[] = [];

      if (campaign_name) {
        query += ` AND name LIKE ?`;
        params.push(`%${campaign_name}%`);
      }
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      query += ` ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'planning' THEN 1 WHEN 'completed' THEN 2 END, start_date DESC`;

      const campaigns = db.prepare(query).all(...params) as any[];

      if (campaigns.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No campaigns found.' }] };
      }

      const result = campaigns.map((c) => {
        const topDonors = db.prepare(`
          SELECT don.name, SUM(d.amount) as total
          FROM donations d JOIN donors don ON don.id = d.donor_id
          WHERE d.campaign_id = ?
          GROUP BY d.donor_id ORDER BY total DESC LIMIT 5
        `).all(c.id) as any[];

        const recentDonations = db.prepare(`
          SELECT don.name, d.amount, d.date
          FROM donations d JOIN donors don ON don.id = d.donor_id
          WHERE d.campaign_id = ?
          ORDER BY d.date DESC LIMIT 5
        `).all(c.id) as any[];

        const pledges = db.prepare(`
          SELECT SUM(amount) as pledged, SUM(amount_paid) as paid
          FROM pledges WHERE campaign_id = ? AND status IN ('active', 'overdue')
        `).get(c.id) as any;

        const percentToGoal = c.goal > 0 ? Math.round((c.raised / c.goal) * 100) : 0;

        return {
          name: c.name,
          type: c.type,
          status: c.status,
          goal: c.goal,
          raised: c.raised,
          percent_to_goal: percentToGoal,
          donor_count: c.donor_count,
          dates: { start: c.start_date, end: c.end_date },
          description: c.description,
          outstanding_pledges: pledges?.pledged ? { pledged: pledges.pledged, paid: pledges.paid, remaining: pledges.pledged - pledges.paid } : null,
          top_donors: topDonors.map((d) => ({ name: d.name, total: d.total })),
          recent_donations: recentDonations.map((d) => ({ donor: d.name, amount: d.amount, date: d.date })),
        };
      });

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ campaigns: result }, null, 2) }],
      };
    }
  );
}
