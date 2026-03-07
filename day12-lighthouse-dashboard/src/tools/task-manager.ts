import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerTaskManager(server: McpServer) {
  server.tool(
    'task_manager',
    'Manage optimization tasks — view open tasks, filter by priority or category, and see estimated impact for each fix',
    {
      site_name: z.string().optional().describe('Filter by site name (partial match)'),
      priority: z.string().optional().describe('Filter by priority (critical, high, medium, low)'),
      status: z.string().optional().describe('Filter by status (open, in_progress, completed)'),
      category: z.string().optional().describe('Filter by category (performance, accessibility, best-practices, seo)'),
    },
    async ({ site_name, priority, status, category }) => {
      let query = `
        SELECT t.*, s.name AS site_name, s.url,
               f.title AS finding_title, f.severity AS finding_severity, f.savings_ms
        FROM tasks t
        JOIN sites s ON s.id = t.site_id
        LEFT JOIN findings f ON f.id = t.finding_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (site_name) {
        query += ` AND s.name LIKE ?`;
        params.push(`%${site_name}%`);
      }
      if (priority) {
        query += ` AND t.priority = ?`;
        params.push(priority);
      }
      if (status) {
        query += ` AND t.status = ?`;
        params.push(status);
      }
      if (category) {
        query += ` AND t.category = ?`;
        params.push(category);
      }

      query += ` ORDER BY
        CASE t.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
        t.created_at DESC`;

      const rows = db.prepare(query).all(...params) as any[];

      if (rows.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No tasks found matching your criteria.' }] };
      }

      // Summary
      const byPriority = {
        critical: rows.filter((r) => r.priority === 'critical').length,
        high: rows.filter((r) => r.priority === 'high').length,
        medium: rows.filter((r) => r.priority === 'medium').length,
        low: rows.filter((r) => r.priority === 'low').length,
      };
      const byStatus = {
        open: rows.filter((r) => r.status === 'open').length,
        in_progress: rows.filter((r) => r.status === 'in_progress').length,
        completed: rows.filter((r) => r.status === 'completed').length,
      };

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            total_tasks: rows.length,
            by_priority: byPriority,
            by_status: byStatus,
            tasks: rows.map((r) => ({
              title: r.title,
              site: r.site_name,
              priority: r.priority,
              category: r.category,
              status: r.status,
              estimated_impact: r.estimated_impact,
              assigned_to: r.assigned_to,
              related_finding: r.finding_title || null,
              potential_savings_ms: r.savings_ms || null,
              created_at: r.created_at,
              completed_at: r.completed_at,
            })),
          }, null, 2),
        }],
      };
    }
  );
}
