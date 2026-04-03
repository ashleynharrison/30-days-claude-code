import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerSearchMeetings(server: McpServer) {
  server.tool(
    'search_meetings',
    'Search past meetings by keyword, type, date range, or participant. Returns matching meetings with summaries and attendee lists.',
    {
      query: z.string().optional().describe('Search term to match against title, summary, or notes'),
      meeting_type: z.string().optional().describe('Filter by type: planning, retrospective, review, technical, standup, cross_functional, one_on_one, postmortem, all_hands'),
      participant: z.string().optional().describe('Filter by participant name'),
      after: z.string().optional().describe('Only meetings after this date (YYYY-MM-DD)'),
      before: z.string().optional().describe('Only meetings before this date (YYYY-MM-DD)'),
    },
    async (params) => {
      let sql = `
        SELECT DISTINCT m.id, m.title, m.meeting_type, m.date, m.duration_minutes,
               p.name as organizer, m.status, m.summary
        FROM meetings m
        JOIN participants p ON m.organizer_id = p.id
        LEFT JOIN attendees a ON m.id = a.meeting_id
        LEFT JOIN participants ap ON a.participant_id = ap.id
        LEFT JOIN notes n ON m.id = n.meeting_id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.query) {
        sql += ' AND (m.title LIKE ? OR m.summary LIKE ? OR n.content LIKE ?)';
        const q = `%${params.query}%`;
        args.push(q, q, q);
      }
      if (params.meeting_type) {
        sql += ' AND m.meeting_type = ?';
        args.push(params.meeting_type);
      }
      if (params.participant) {
        sql += ' AND ap.name LIKE ?';
        args.push(`%${params.participant}%`);
      }
      if (params.after) {
        sql += ' AND m.date >= ?';
        args.push(params.after);
      }
      if (params.before) {
        sql += ' AND m.date <= ?';
        args.push(params.before);
      }

      sql += ' ORDER BY m.date DESC';

      const meetings = db.prepare(sql).all(...args) as Array<{
        id: number; title: string; meeting_type: string; date: string;
        duration_minutes: number; organizer: string; status: string; summary: string | null;
      }>;

      const results = meetings.map(m => {
        const attendees = db.prepare(`
          SELECT p.name, p.role, p.department, a.attended
          FROM attendees a JOIN participants p ON a.participant_id = p.id
          WHERE a.meeting_id = ?
        `).all(m.id) as Array<{ name: string; role: string; department: string; attended: number }>;

        const actionCount = db.prepare(`
          SELECT COUNT(*) as count FROM action_items WHERE meeting_id = ?
        `).get(m.id) as { count: number };

        const decisionCount = db.prepare(`
          SELECT COUNT(*) as count FROM decisions WHERE meeting_id = ?
        `).get(m.id) as { count: number };

        return {
          ...m,
          attendees: attendees.map(a => ({
            name: a.name,
            role: a.role,
            department: a.department,
            attended: a.attended === 1,
          })),
          action_items: actionCount.count,
          decisions: decisionCount.count,
        };
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ count: results.length, meetings: results }, null, 2),
        }],
      };
    },
  );
}
