import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerCourseRoster(server: McpServer) {
  server.tool(
    'course_roster',
    'View course details and enrolled students with grades, attendance, and last activity. Filter by course code, department, or instructor.',
    {
      course_code: z.string().optional().describe('Filter by course code (e.g. CS101, DS301)'),
      department: z.string().optional().describe('Filter by department (e.g. Computer Science, Business)'),
      instructor: z.string().optional().describe('Filter by instructor name (partial match)'),
    },
    async ({ course_code, department, instructor }) => {
      let query = `
        SELECT c.*, i.name as instructor_name, i.email as instructor_email
        FROM courses c
        JOIN instructors i ON c.instructor_id = i.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (course_code) {
        query += ` AND c.code = ?`;
        params.push(course_code.toUpperCase());
      }
      if (department) {
        query += ` AND c.department LIKE ?`;
        params.push(`%${department}%`);
      }
      if (instructor) {
        query += ` AND i.name LIKE ?`;
        params.push(`%${instructor}%`);
      }

      query += ` ORDER BY c.code`;

      const courses = db.prepare(query).all(...params) as any[];

      if (courses.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No courses found matching your criteria.' }] };
      }

      const result = courses.map((c) => {
        const roster = db.prepare(`
          SELECT s.name, s.student_id, s.year, e.current_grade, e.attendance_pct, e.last_activity
          FROM enrollments e
          JOIN students s ON e.student_id = s.id
          WHERE e.course_id = ? AND e.status = 'enrolled'
          ORDER BY s.name
        `).all(c.id) as any[];

        const grades = roster.filter((r: any) => r.current_grade !== null).map((r: any) => r.current_grade);
        const avgGrade = grades.length > 0 ? Math.round(grades.reduce((a: number, b: number) => a + b, 0) / grades.length) : null;
        const avgAttendance = roster.length > 0 ? Math.round(roster.reduce((sum: number, r: any) => sum + r.attendance_pct, 0) / roster.length) : null;

        return {
          code: c.code,
          title: c.title,
          department: c.department,
          instructor: c.instructor_name,
          level: c.level,
          schedule: c.schedule,
          dates: `${c.start_date} to ${c.end_date}`,
          enrolled: roster.length,
          max_students: c.max_students,
          capacity_pct: Math.round((roster.length / c.max_students) * 100),
          class_average: avgGrade,
          avg_attendance: avgAttendance ? `${avgAttendance}%` : null,
          students: roster.map((r: any) => ({
            name: r.name,
            student_id: r.student_id,
            year: r.year,
            grade: r.current_grade,
            attendance: `${r.attendance_pct}%`,
            last_active: r.last_activity,
          })),
        };
      });

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ courses: result, count: result.length }, null, 2) }],
      };
    }
  );
}
