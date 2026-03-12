import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerStudentLookup(server: McpServer) {
  server.tool(
    'student_lookup',
    'Search students by name, major, year, or status. Returns academic info, GPA, current enrollments, and performance summary.',
    {
      search: z.string().optional().describe('Search by student name (partial match)'),
      major: z.string().optional().describe('Filter by major (e.g. Computer Science, Data Science, Business, Design)'),
      year: z.enum(['freshman', 'sophomore', 'junior', 'senior']).optional().describe('Filter by class year'),
      status: z.enum(['active', 'probation', 'inactive']).optional().describe('Filter by student status'),
    },
    async ({ search, major, year, status }) => {
      let query = `SELECT * FROM students WHERE 1=1`;
      const params: any[] = [];

      if (search) {
        query += ` AND name LIKE ?`;
        params.push(`%${search}%`);
      }
      if (major) {
        query += ` AND major LIKE ?`;
        params.push(`%${major}%`);
      }
      if (year) {
        query += ` AND year = ?`;
        params.push(year);
      }
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      query += ` ORDER BY name`;

      const students = db.prepare(query).all(...params) as any[];

      if (students.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No students found matching your criteria.' }] };
      }

      const result = students.map((s) => {
        const enrollments = db.prepare(`
          SELECT e.current_grade, e.attendance_pct, e.last_activity, c.code, c.title
          FROM enrollments e
          JOIN courses c ON e.course_id = c.id
          WHERE e.student_id = ? AND e.status = 'enrolled'
        `).all(s.id) as any[];

        const avgGrade = enrollments.length > 0
          ? Math.round(enrollments.reduce((sum: number, e: any) => sum + (e.current_grade || 0), 0) / enrollments.length)
          : null;

        return {
          name: s.name,
          student_id: s.student_id,
          email: s.email,
          major: s.major,
          year: s.year,
          gpa: s.gpa,
          status: s.status,
          enrolled_since: s.enrolled_date,
          current_courses: enrollments.map((e: any) => ({
            code: e.code,
            title: e.title,
            grade: e.current_grade,
            attendance: `${e.attendance_pct}%`,
            last_active: e.last_activity,
          })),
          course_count: enrollments.length,
          average_current_grade: avgGrade,
        };
      });

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ students: result, count: result.length }, null, 2) }],
      };
    }
  );
}
