import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerAssignmentTracker(server: McpServer) {
  server.tool(
    'assignment_tracker',
    'View assignments by course with due dates, submission rates, average scores, and upcoming deadlines.',
    {
      course_code: z.string().optional().describe('Filter by course code'),
      type: z.enum(['quiz', 'lab', 'homework', 'project', 'exam']).optional().describe('Filter by assignment type'),
      upcoming_only: z.boolean().optional().describe('Show only assignments with future due dates'),
    },
    async ({ course_code, type, upcoming_only }) => {
      const today = new Date().toISOString().split('T')[0];

      let query = `
        SELECT a.*, c.code as course_code, c.title as course_title
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (course_code) {
        query += ` AND c.code = ?`;
        params.push(course_code.toUpperCase());
      }
      if (type) {
        query += ` AND a.type = ?`;
        params.push(type);
      }
      if (upcoming_only) {
        query += ` AND a.due_date >= ?`;
        params.push(today);
      }

      query += ` ORDER BY a.due_date ASC`;

      const assignments = db.prepare(query).all(...params) as any[];

      if (assignments.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No assignments found matching your criteria.' }] };
      }

      const result = assignments.map((a) => {
        const stats = db.prepare(`
          SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) as graded,
            SUM(CASE WHEN status = 'missing' THEN 1 ELSE 0 END) as missing,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            AVG(CASE WHEN score IS NOT NULL THEN score ELSE NULL END) as avg_score,
            MIN(CASE WHEN score IS NOT NULL THEN score ELSE NULL END) as min_score,
            MAX(CASE WHEN score IS NOT NULL THEN score ELSE NULL END) as max_score
          FROM submissions WHERE assignment_id = ?
        `).get(a.id) as any;

        const enrolledCount = (db.prepare(`
          SELECT COUNT(*) as c FROM enrollments WHERE course_id = ? AND status = 'enrolled'
        `).get(a.course_id) as any).c;

        return {
          course: `${a.course_code} — ${a.course_title}`,
          title: a.title,
          type: a.type,
          due_date: a.due_date,
          is_past_due: a.due_date < today,
          max_points: a.max_points,
          weight: a.weight,
          enrolled_students: enrolledCount,
          submitted: stats.graded + stats.pending,
          graded: stats.graded,
          missing: stats.missing,
          submission_rate: enrolledCount > 0 ? `${Math.round(((stats.graded + stats.pending) / enrolledCount) * 100)}%` : 'N/A',
          avg_score: stats.avg_score ? `${Math.round(stats.avg_score)}/${a.max_points} (${Math.round((stats.avg_score / a.max_points) * 100)}%)` : 'N/A',
          score_range: stats.min_score !== null ? `${stats.min_score} - ${stats.max_score}` : 'N/A',
        };
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            assignments: result,
            count: result.length,
          }, null, 2),
        }],
      };
    }
  );
}
