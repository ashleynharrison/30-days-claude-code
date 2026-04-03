import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerMeetingSummary(server: McpServer) {
  server.tool(
    'meeting_summary',
    'Get the full summary of a specific meeting — attendees, notes, decisions, and action items in one view.',
    {
      meeting_id: z.number().optional().describe('Meeting ID to summarize'),
      title: z.string().optional().describe('Search by meeting title (partial match)'),
    },
    async (params) => {
      let meeting;
      if (params.meeting_id) {
        meeting = db.prepare(`
          SELECT m.*, p.name as organizer_name FROM meetings m
          JOIN participants p ON m.organizer_id = p.id WHERE m.id = ?
        `).get(params.meeting_id) as Record<string, unknown> | undefined;
      } else if (params.title) {
        meeting = db.prepare(`
          SELECT m.*, p.name as organizer_name FROM meetings m
          JOIN participants p ON m.organizer_id = p.id WHERE m.title LIKE ?
        `).get(`%${params.title}%`) as Record<string, unknown> | undefined;
      }

      if (!meeting) {
        return { content: [{ type: 'text' as const, text: 'Meeting not found. Use search_meetings to find the right meeting.' }] };
      }

      const attendees = db.prepare(`
        SELECT p.name, p.role, p.department, a.attended
        FROM attendees a JOIN participants p ON a.participant_id = p.id
        WHERE a.meeting_id = ?
      `).all(meeting.id) as Array<{ name: string; role: string; department: string; attended: number }>;

      const meetingNotes = db.prepare(`
        SELECT n.content, n.topic, n.timestamp_minutes, p.name as speaker
        FROM notes n LEFT JOIN participants p ON n.speaker_id = p.id
        WHERE n.meeting_id = ? ORDER BY n.timestamp_minutes
      `).all(meeting.id) as Array<{ content: string; topic: string; timestamp_minutes: number; speaker: string | null }>;

      const actions = db.prepare(`
        SELECT ai.description, ai.priority, ai.status, ai.due_date, ai.completed_at, p.name as owner
        FROM action_items ai JOIN participants p ON ai.owner_id = p.id
        WHERE ai.meeting_id = ? ORDER BY ai.priority DESC
      `).all(meeting.id) as Array<{
        description: string; priority: string; status: string;
        due_date: string | null; completed_at: string | null; owner: string;
      }>;

      const meetingDecisions = db.prepare(`
        SELECT description, context, decided_by, impact FROM decisions WHERE meeting_id = ?
      `).all(meeting.id) as Array<{
        description: string; context: string | null; decided_by: string | null; impact: string;
      }>;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            meeting: {
              id: meeting.id,
              title: meeting.title,
              type: meeting.meeting_type,
              date: meeting.date,
              duration_minutes: meeting.duration_minutes,
              organizer: meeting.organizer_name,
              status: meeting.status,
              summary: meeting.summary,
            },
            attendees: attendees.map(a => ({
              name: a.name, role: a.role, department: a.department, attended: a.attended === 1,
            })),
            notes: meetingNotes,
            decisions: meetingDecisions,
            action_items: actions,
          }, null, 2),
        }],
      };
    },
  );
}
