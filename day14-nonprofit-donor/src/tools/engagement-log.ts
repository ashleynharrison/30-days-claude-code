import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerEngagementLog(server: McpServer) {
  server.tool(
    'engagement_log',
    'View donor engagement and contact history — meetings, calls, emails, and events. Track stewardship activity and identify donors needing outreach.',
    {
      donor_name: z.string().optional().describe('Filter by donor name (partial match)'),
      type: z.enum(['meeting', 'phone', 'email', 'event']).optional().describe('Filter by engagement type'),
      staff_member: z.string().optional().describe('Filter by staff member name'),
      needs_outreach: z.boolean().optional().describe('Show donors with no engagement in 30+ days'),
    },
    async ({ donor_name, type, staff_member, needs_outreach }) => {
      if (needs_outreach) {
        // Find active donors with no recent engagement
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoff = thirtyDaysAgo.toISOString().split('T')[0];

        const donorsNeedingOutreach = db.prepare(`
          SELECT d.id, d.name, d.email, d.giving_level, d.total_given, d.status,
            (SELECT MAX(e.date) FROM engagements e WHERE e.donor_id = d.id) as last_engagement,
            (SELECT MAX(don.date) FROM donations don WHERE don.donor_id = d.id) as last_gift
          FROM donors d
          WHERE d.status = 'active'
          AND (
            d.id NOT IN (SELECT DISTINCT donor_id FROM engagements WHERE date >= ?)
          )
          ORDER BY d.total_given DESC
        `).all(cutoff) as any[];

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              donors_needing_outreach: donorsNeedingOutreach.map((d) => ({
                name: d.name,
                email: d.email,
                giving_level: d.giving_level,
                lifetime_giving: d.total_given,
                last_engagement: d.last_engagement,
                last_gift: d.last_gift,
                days_since_contact: d.last_engagement
                  ? Math.floor((Date.now() - new Date(d.last_engagement).getTime()) / (1000 * 60 * 60 * 24))
                  : 'never',
              })),
              count: donorsNeedingOutreach.length,
            }, null, 2),
          }],
        };
      }

      let query = `
        SELECT e.*, d.name as donor_name, d.giving_level
        FROM engagements e
        JOIN donors d ON d.id = e.donor_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (donor_name) {
        query += ` AND d.name LIKE ?`;
        params.push(`%${donor_name}%`);
      }
      if (type) {
        query += ` AND e.type = ?`;
        params.push(type);
      }
      if (staff_member) {
        query += ` AND e.staff_member LIKE ?`;
        params.push(`%${staff_member}%`);
      }

      query += ` ORDER BY e.date DESC`;

      const engagements = db.prepare(query).all(...params) as any[];

      if (engagements.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No engagements found.' }] };
      }

      // Staff activity summary
      const staffSummary = db.prepare(`
        SELECT staff_member, COUNT(*) as touches, COUNT(DISTINCT donor_id) as unique_donors
        FROM engagements GROUP BY staff_member ORDER BY touches DESC
      `).all() as any[];

      const result = {
        engagements: engagements.map((e) => ({
          donor: e.donor_name,
          giving_level: e.giving_level,
          type: e.type,
          date: e.date,
          staff: e.staff_member,
          subject: e.subject,
          notes: e.notes,
        })),
        count: engagements.length,
        staff_activity: staffSummary.map((s) => ({
          staff: s.staff_member,
          total_touches: s.touches,
          unique_donors: s.unique_donors,
        })),
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
