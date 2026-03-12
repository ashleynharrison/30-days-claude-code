import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerAtRiskStudents(server: McpServer) {
  server.tool(
    'at_risk_students',
    'Identify students falling behind — low grades, poor attendance, missing assignments, or inactivity. Configurable thresholds.',
    {
      grade_threshold: z.number().optional().describe('Flag students with current grade below this (default: 70)'),
      attendance_threshold: z.number().optional().describe('Flag students with attendance below this % (default: 80)'),
      inactive_days: z.number().optional().describe('Flag students inactive for this many days (default: 7)'),
      course_code: z.string().optional().describe('Limit to a specific course'),
    },
    async ({ grade_threshold = 70, attendance_threshold = 80, inactive_days = 7, course_code }) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - inactive_days);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      let query = `
        SELECT e.*, s.name as student_name, s.student_id as sid, s.email, s.gpa, s.status as student_status,
               c.code as course_code, c.title as course_title
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN courses c ON e.course_id = c.id
        WHERE e.status = 'enrolled'
          AND (e.current_grade < ? OR e.attendance_pct < ? OR e.last_activity < ?)
      `;
      const params: any[] = [grade_threshold, attendance_threshold, cutoffStr];

      if (course_code) {
        query += ` AND c.code = ?`;
        params.push(course_code.toUpperCase());
      }

      query += ` ORDER BY e.current_grade ASC`;

      const atRisk = db.prepare(query).all(...params) as any[];

      if (atRisk.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No at-risk students found with the given thresholds.' }] };
      }

      const result = atRisk.map((r) => {
        const missingCount = (db.prepare(`
          SELECT COUNT(*) as c FROM submissions
          WHERE student_id = ? AND assignment_id IN (SELECT id FROM assignments WHERE course_id = ?) AND status = 'missing'
        `).get(r.student_id, r.course_id) as any).c;

        const risks: string[] = [];
        if (r.current_grade < grade_threshold) risks.push(`Low grade: ${r.current_grade}%`);
        if (r.attendance_pct < attendance_threshold) risks.push(`Low attendance: ${r.attendance_pct}%`);
        if (r.last_activity < cutoffStr) risks.push(`Inactive since: ${r.last_activity}`);
        if (missingCount > 0) risks.push(`${missingCount} missing assignment(s)`);

        return {
          student: r.student_name,
          student_id: r.sid,
          email: r.email,
          course: `${r.course_code} — ${r.course_title}`,
          current_grade: r.current_grade,
          attendance: `${r.attendance_pct}%`,
          last_active: r.last_activity,
          gpa: r.gpa,
          student_status: r.student_status,
          missing_assignments: missingCount,
          risk_factors: risks,
        };
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            at_risk_students: result,
            count: result.length,
            thresholds: { grade: grade_threshold, attendance: attendance_threshold, inactive_days },
          }, null, 2),
        }],
      };
    }
  );
}
