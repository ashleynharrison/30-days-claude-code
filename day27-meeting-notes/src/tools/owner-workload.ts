import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerOwnerWorkload(server: McpServer) {
  server.tool(
    'owner_workload',
    'See action item workload by person — open items, overdue counts, completion rates, and priority breakdown. Identify who is overloaded.',
    {
      name: z.string().optional().describe('Filter to a specific person (partial name match)'),
      department: z.string().optional().describe('Filter by department'),
    },
    async (params) => {
      let participantSql = 'SELECT * FROM participants WHERE 1=1';
      const args: unknown[] = [];

      if (params.name) {
        participantSql += ' AND name LIKE ?';
        args.push(`%${params.name}%`);
      }
      if (params.department) {
        participantSql += ' AND department = ?';
        args.push(params.department);
      }

      const people = db.prepare(participantSql).all(...args) as Array<{
        id: number; name: string; email: string; role: string; department: string;
      }>;

      const today = new Date().toISOString().split('T')[0];

      const workloads = people.map(person => {
        const allItems = db.prepare(`
          SELECT ai.status, ai.priority, ai.due_date
          FROM action_items ai WHERE ai.owner_id = ?
        `).all(person.id) as Array<{ status: string; priority: string; due_date: string | null }>;

        const open = allItems.filter(i => i.status === 'open');
        const inProgress = allItems.filter(i => i.status === 'in_progress');
        const completed = allItems.filter(i => i.status === 'completed');
        const overdue = allItems.filter(i => i.status !== 'completed' && i.due_date && i.due_date < today);

        const meetingsAttended = db.prepare(`
          SELECT COUNT(*) as count FROM attendees WHERE participant_id = ? AND attended = 1
        `).get(person.id) as { count: number };

        return {
          name: person.name,
          role: person.role,
          department: person.department,
          total_items: allItems.length,
          open: open.length,
          in_progress: inProgress.length,
          completed: completed.length,
          overdue: overdue.length,
          completion_rate: allItems.length > 0
            ? Math.round((completed.length / allItems.length) * 100)
            : 0,
          critical_open: allItems.filter(i => i.status !== 'completed' && i.priority === 'critical').length,
          high_open: allItems.filter(i => i.status !== 'completed' && i.priority === 'high').length,
          meetings_attended: meetingsAttended.count,
        };
      }).filter(w => w.total_items > 0).sort((a, b) => b.overdue - a.overdue || b.open - a.open);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            count: workloads.length,
            team_summary: {
              total_open: workloads.reduce((s, w) => s + w.open + w.in_progress, 0),
              total_overdue: workloads.reduce((s, w) => s + w.overdue, 0),
              avg_completion_rate: Math.round(workloads.reduce((s, w) => s + w.completion_rate, 0) / (workloads.length || 1)),
            },
            workloads,
          }, null, 2),
        }],
      };
    },
  );
}
