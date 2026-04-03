import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerActionItems(server: McpServer) {
  server.tool(
    'action_items',
    'List and filter action items across all meetings — by status, owner, priority, or due date. Find overdue items and track completion.',
    {
      status: z.string().optional().describe('Filter by status: open, in_progress, completed'),
      owner: z.string().optional().describe('Filter by owner name'),
      priority: z.string().optional().describe('Filter by priority: critical, high, medium, low'),
      overdue: z.boolean().optional().describe('Set to true to show only overdue items'),
      due_before: z.string().optional().describe('Show items due before this date (YYYY-MM-DD)'),
    },
    async (params) => {
      let sql = `
        SELECT ai.id, ai.description, ai.priority, ai.status, ai.due_date,
               ai.completed_at, ai.created_at,
               p.name as owner, p.department,
               m.title as meeting_title, m.date as meeting_date
        FROM action_items ai
        JOIN participants p ON ai.owner_id = p.id
        JOIN meetings m ON ai.meeting_id = m.id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.status) {
        sql += ' AND ai.status = ?';
        args.push(params.status);
      }
      if (params.owner) {
        sql += ' AND p.name LIKE ?';
        args.push(`%${params.owner}%`);
      }
      if (params.priority) {
        sql += ' AND ai.priority = ?';
        args.push(params.priority);
      }
      if (params.overdue) {
        sql += " AND ai.status != 'completed' AND ai.due_date < datetime('now')";
      }
      if (params.due_before) {
        sql += ' AND ai.due_date <= ?';
        args.push(params.due_before);
      }

      sql += ' ORDER BY CASE ai.priority WHEN \'critical\' THEN 0 WHEN \'high\' THEN 1 WHEN \'medium\' THEN 2 WHEN \'low\' THEN 3 END, ai.due_date';

      const items = db.prepare(sql).all(...args) as Array<{
        id: number; description: string; priority: string; status: string;
        due_date: string | null; completed_at: string | null; created_at: string;
        owner: string; department: string; meeting_title: string; meeting_date: string;
      }>;

      const summary = {
        total: items.length,
        by_status: {
          open: items.filter(i => i.status === 'open').length,
          in_progress: items.filter(i => i.status === 'in_progress').length,
          completed: items.filter(i => i.status === 'completed').length,
        },
        by_priority: {
          critical: items.filter(i => i.priority === 'critical').length,
          high: items.filter(i => i.priority === 'high').length,
          medium: items.filter(i => i.priority === 'medium').length,
          low: items.filter(i => i.priority === 'low').length,
        },
        overdue: items.filter(i => i.status !== 'completed' && i.due_date && i.due_date < new Date().toISOString().split('T')[0]).length,
      };

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ summary, action_items: items }, null, 2),
        }],
      };
    },
  );
}
