import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerFollowUps(server: McpServer) {
  server.tool(
    'follow_ups',
    'Generate a follow-up report — overdue action items, upcoming deadlines, unresolved decisions, and items that need attention this week.',
    {
      days_ahead: z.number().optional().describe('Number of days to look ahead for upcoming deadlines (default: 7)'),
      owner: z.string().optional().describe('Filter to a specific person'),
    },
    async (params) => {
      const daysAhead = params.days_ahead ?? 7;
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + daysAhead);
      const todayStr = today.toISOString().split('T')[0];
      const futureStr = futureDate.toISOString().split('T')[0];

      let ownerFilter = '';
      const ownerArgs: unknown[] = [];
      if (params.owner) {
        ownerFilter = ' AND p.name LIKE ?';
        ownerArgs.push(`%${params.owner}%`);
      }

      // Overdue items
      const overdue = db.prepare(`
        SELECT ai.description, ai.priority, ai.due_date, ai.status,
               p.name as owner, m.title as meeting_title
        FROM action_items ai
        JOIN participants p ON ai.owner_id = p.id
        JOIN meetings m ON ai.meeting_id = m.id
        WHERE ai.status != 'completed' AND ai.due_date < ?${ownerFilter}
        ORDER BY ai.due_date, ai.priority
      `).all(todayStr, ...ownerArgs) as Array<{
        description: string; priority: string; due_date: string;
        status: string; owner: string; meeting_title: string;
      }>;

      // Due this week
      const upcoming = db.prepare(`
        SELECT ai.description, ai.priority, ai.due_date, ai.status,
               p.name as owner, m.title as meeting_title
        FROM action_items ai
        JOIN participants p ON ai.owner_id = p.id
        JOIN meetings m ON ai.meeting_id = m.id
        WHERE ai.status != 'completed' AND ai.due_date >= ? AND ai.due_date <= ?${ownerFilter}
        ORDER BY ai.due_date, ai.priority
      `).all(todayStr, futureStr, ...ownerArgs) as Array<{
        description: string; priority: string; due_date: string;
        status: string; owner: string; meeting_title: string;
      }>;

      // Recently completed
      const recentlyCompleted = db.prepare(`
        SELECT ai.description, ai.priority, ai.completed_at,
               p.name as owner, m.title as meeting_title
        FROM action_items ai
        JOIN participants p ON ai.owner_id = p.id
        JOIN meetings m ON ai.meeting_id = m.id
        WHERE ai.status = 'completed' AND ai.completed_at >= ?${ownerFilter}
        ORDER BY ai.completed_at DESC
      `).all(todayStr.slice(0, 8) + '01', ...ownerArgs) as Array<{
        description: string; priority: string; completed_at: string;
        owner: string; meeting_title: string;
      }>;

      // In progress items
      const inProgress = db.prepare(`
        SELECT ai.description, ai.priority, ai.due_date,
               p.name as owner, m.title as meeting_title
        FROM action_items ai
        JOIN participants p ON ai.owner_id = p.id
        JOIN meetings m ON ai.meeting_id = m.id
        WHERE ai.status = 'in_progress'${ownerFilter}
        ORDER BY ai.due_date
      `).all(...ownerArgs) as Array<{
        description: string; priority: string; due_date: string | null;
        owner: string; meeting_title: string;
      }>;

      // Recent high-impact decisions
      const recentDecisions = db.prepare(`
        SELECT d.description, d.decided_by, d.impact, m.title as meeting_title, m.date
        FROM decisions d JOIN meetings m ON d.meeting_id = m.id
        WHERE d.impact IN ('critical', 'high')
        ORDER BY m.date DESC LIMIT 5
      `).all() as Array<{
        description: string; decided_by: string | null; impact: string;
        meeting_title: string; date: string;
      }>;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            report_date: todayStr,
            looking_ahead: `${daysAhead} days (through ${futureStr})`,
            overdue: { count: overdue.length, items: overdue },
            due_soon: { count: upcoming.length, items: upcoming },
            in_progress: { count: inProgress.length, items: inProgress },
            recently_completed: { count: recentlyCompleted.length, items: recentlyCompleted },
            key_decisions: recentDecisions,
          }, null, 2),
        }],
      };
    },
  );
}
