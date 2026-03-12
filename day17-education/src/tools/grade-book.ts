import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerGradeBook(server: McpServer) {
  server.tool(
    'grade_book',
    'View assignment grades and submissions for a course or student. Shows scores, missing work, and grade trends.',
    {
      course_code: z.string().optional().describe('Filter by course code (e.g. CS101)'),
      student_name: z.string().optional().describe('Filter by student name (partial match)'),
      assignment_type: z.enum(['quiz', 'lab', 'homework', 'project', 'exam']).optional().describe('Filter by assignment type'),
      status: z.enum(['graded', 'pending', 'missing']).optional().describe('Filter by submission status'),
    },
    async ({ course_code, student_name, assignment_type, status }) => {
      let query = `
        SELECT sub.*, a.title as assignment_title, a.type as assignment_type, a.max_points, a.due_date, a.weight,
               c.code as course_code, c.title as course_title, s.name as student_name, s.student_id as sid
        FROM submissions sub
        JOIN assignments a ON sub.assignment_id = a.id
        JOIN courses c ON a.course_id = c.id
        JOIN students s ON sub.student_id = s.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (course_code) {
        query += ` AND c.code = ?`;
        params.push(course_code.toUpperCase());
      }
      if (student_name) {
        query += ` AND s.name LIKE ?`;
        params.push(`%${student_name}%`);
      }
      if (assignment_type) {
        query += ` AND a.type = ?`;
        params.push(assignment_type);
      }
      if (status) {
        query += ` AND sub.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY a.due_date DESC, s.name`;

      const submissions = db.prepare(query).all(...params) as any[];

      if (submissions.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No submissions found matching your criteria.' }] };
      }

      const result = submissions.map((sub) => ({
        student: sub.student_name,
        student_id: sub.sid,
        course: `${sub.course_code} — ${sub.course_title}`,
        assignment: sub.assignment_title,
        type: sub.assignment_type,
        due_date: sub.due_date,
        submitted: sub.submitted_date,
        score: sub.score !== null ? `${sub.score}/${sub.max_points}` : null,
        percentage: sub.score !== null ? `${Math.round((sub.score / sub.max_points) * 100)}%` : null,
        weight: sub.weight,
        status: sub.status,
        feedback: sub.feedback,
      }));

      const graded = result.filter((r) => r.status === 'graded');
      const missing = result.filter((r) => r.status === 'missing');

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            submissions: result,
            summary: {
              total: result.length,
              graded: graded.length,
              missing: missing.length,
              pending: result.filter((r) => r.status === 'pending').length,
            },
            count: result.length,
          }, null, 2),
        }],
      };
    }
  );
}
