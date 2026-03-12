import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerCourseAnalytics(server: McpServer) {
  server.tool(
    'course_analytics',
    'Department and course-level analytics — enrollment trends, grade distributions, attendance patterns, and instructor workload.',
    {
      department: z.string().optional().describe('Filter by department'),
      course_code: z.string().optional().describe('Drill into a specific course'),
    },
    async ({ department, course_code }) => {
      if (course_code) {
        const course = db.prepare(`
          SELECT c.*, i.name as instructor_name
          FROM courses c
          JOIN instructors i ON c.instructor_id = i.id
          WHERE c.code = ?
        `).get(course_code.toUpperCase()) as any;

        if (!course) {
          return { content: [{ type: 'text' as const, text: `Course ${course_code} not found.` }] };
        }

        const enrollments = db.prepare(`
          SELECT e.current_grade, e.attendance_pct
          FROM enrollments e WHERE e.course_id = ? AND e.status = 'enrolled'
        `).all(course.id) as any[];

        const grades = enrollments.map((e: any) => e.current_grade).filter((g: any) => g !== null);
        const gradeDistribution = {
          A: grades.filter((g: number) => g >= 90).length,
          B: grades.filter((g: number) => g >= 80 && g < 90).length,
          C: grades.filter((g: number) => g >= 70 && g < 80).length,
          D: grades.filter((g: number) => g >= 60 && g < 70).length,
          F: grades.filter((g: number) => g < 60).length,
        };

        const avgGrade = grades.length > 0 ? Math.round(grades.reduce((a: number, b: number) => a + b, 0) / grades.length) : null;
        const avgAttendance = enrollments.length > 0
          ? Math.round(enrollments.reduce((sum: number, e: any) => sum + e.attendance_pct, 0) / enrollments.length)
          : null;

        const assignmentStats = db.prepare(`
          SELECT
            COUNT(*) as total_assignments,
            SUM(CASE WHEN a.due_date < date('now') THEN 1 ELSE 0 END) as past_due,
            SUM(CASE WHEN a.due_date >= date('now') THEN 1 ELSE 0 END) as upcoming
          FROM assignments a WHERE a.course_id = ?
        `).get(course.id) as any;

        const missingRate = db.prepare(`
          SELECT
            COUNT(*) as total,
            SUM(CASE WHEN sub.status = 'missing' THEN 1 ELSE 0 END) as missing
          FROM submissions sub
          JOIN assignments a ON sub.assignment_id = a.id
          WHERE a.course_id = ?
        `).get(course.id) as any;

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              course: {
                code: course.code,
                title: course.title,
                instructor: course.instructor_name,
                department: course.department,
                level: course.level,
                schedule: course.schedule,
              },
              enrollment: {
                current: enrollments.length,
                max: course.max_students,
                capacity: `${Math.round((enrollments.length / course.max_students) * 100)}%`,
              },
              grades: {
                average: avgGrade,
                distribution: gradeDistribution,
              },
              attendance: {
                average: avgAttendance ? `${avgAttendance}%` : null,
              },
              assignments: {
                total: assignmentStats.total_assignments,
                completed: assignmentStats.past_due,
                upcoming: assignmentStats.upcoming,
                missing_rate: missingRate.total > 0 ? `${Math.round((missingRate.missing / missingRate.total) * 100)}%` : '0%',
              },
            }, null, 2),
          }],
        };
      }

      // Department or overall analytics
      let courseQuery = `
        SELECT c.*, i.name as instructor_name
        FROM courses c
        JOIN instructors i ON c.instructor_id = i.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (department) {
        courseQuery += ` AND c.department LIKE ?`;
        params.push(`%${department}%`);
      }

      courseQuery += ` ORDER BY c.department, c.code`;
      const courses = db.prepare(courseQuery).all(...params) as any[];

      if (courses.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No courses found.' }] };
      }

      const analytics = courses.map((c) => {
        const enrolled = (db.prepare(`SELECT COUNT(*) as c FROM enrollments WHERE course_id = ? AND status = 'enrolled'`).get(c.id) as any).c;
        const avgGrade = (db.prepare(`SELECT AVG(current_grade) as avg FROM enrollments WHERE course_id = ? AND status = 'enrolled' AND current_grade IS NOT NULL`).get(c.id) as any).avg;
        const avgAtt = (db.prepare(`SELECT AVG(attendance_pct) as avg FROM enrollments WHERE course_id = ? AND status = 'enrolled'`).get(c.id) as any).avg;

        return {
          code: c.code,
          title: c.title,
          department: c.department,
          instructor: c.instructor_name,
          enrolled: enrolled,
          capacity: `${Math.round((enrolled / c.max_students) * 100)}%`,
          avg_grade: avgGrade ? Math.round(avgGrade) : null,
          avg_attendance: avgAtt ? `${Math.round(avgAtt)}%` : null,
        };
      });

      const totalEnrolled = analytics.reduce((sum, a) => sum + a.enrolled, 0);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            courses: analytics,
            summary: {
              total_courses: analytics.length,
              total_enrollments: totalEnrolled,
              overall_avg_grade: Math.round(analytics.filter((a) => a.avg_grade).reduce((sum, a) => sum + a.avg_grade!, 0) / analytics.filter((a) => a.avg_grade).length),
            },
            count: analytics.length,
          }, null, 2),
        }],
      };
    }
  );
}
