import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerGrantTracker(server: McpServer) {
  server.tool(
    'grant_tracker',
    'View grants by status, upcoming deadlines, success rate, and pipeline value. Track submissions, awards, and reporting requirements.',
    {
      status: z.enum(['pending', 'submitted', 'awarded', 'rejected']).optional().describe('Filter by grant status'),
      grantor: z.string().optional().describe('Filter by grantor name (partial match)'),
    },
    async ({ status, grantor }) => {
      let query = `SELECT * FROM grants WHERE 1=1`;
      const params: any[] = [];

      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }
      if (grantor) {
        query += ` AND grantor LIKE ?`;
        params.push(`%${grantor}%`);
      }

      query += ` ORDER BY CASE status WHEN 'submitted' THEN 0 WHEN 'pending' THEN 1 WHEN 'awarded' THEN 2 WHEN 'rejected' THEN 3 END, deadline ASC`;

      const grants = db.prepare(query).all(...params) as any[];

      if (grants.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No grants found.' }] };
      }

      // Pipeline stats
      const allGrants = db.prepare('SELECT * FROM grants').all() as any[];
      const awarded = allGrants.filter((g) => g.status === 'awarded');
      const submitted = allGrants.filter((g) => g.status === 'submitted');
      const pending = allGrants.filter((g) => g.status === 'pending');
      const rejected = allGrants.filter((g) => g.status === 'rejected');

      const pipeline = {
        total_grants: allGrants.length,
        awarded_count: awarded.length,
        awarded_total: awarded.reduce((s, g) => s + g.amount, 0),
        submitted_count: submitted.length,
        submitted_total: submitted.reduce((s, g) => s + g.amount, 0),
        pending_count: pending.length,
        pending_total: pending.reduce((s, g) => s + g.amount, 0),
        rejected_count: rejected.length,
        success_rate: allGrants.filter((g) => g.status !== 'pending').length > 0
          ? Math.round((awarded.length / allGrants.filter((g) => g.status !== 'pending').length) * 100)
          : 0,
      };

      const result = {
        grants: grants.map((g) => ({
          grantor: g.grantor,
          title: g.title,
          amount: g.amount,
          purpose: g.purpose,
          status: g.status,
          submitted: g.submitted_date,
          deadline: g.deadline,
          awarded_date: g.awarded_date,
          report_due: g.report_due,
          contact: g.contact_name ? { name: g.contact_name, email: g.contact_email } : null,
          notes: g.notes,
        })),
        pipeline,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
