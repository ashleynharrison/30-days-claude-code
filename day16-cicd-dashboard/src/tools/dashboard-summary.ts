import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import db from '../database.js';

export function registerDashboardSummary(server: McpServer) {
  server.tool(
    'dashboard_summary',
    'Executive overview — total projects, builds today, overall success rate, deploy frequency, active incidents, and team activity breakdown.',
    {},
    async () => {
      const projectCount = (db.prepare('SELECT COUNT(*) as c FROM projects').get() as { c: number }).c;

      const buildStats = db.prepare(`
        SELECT
          COUNT(*) as total_builds,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as passed,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as running,
          ROUND(100.0 * SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*), 1) as overall_success_rate,
          ROUND(AVG(duration_seconds), 0) as avg_build_time_seconds
        FROM builds
      `).get();

      const recentBuilds = db.prepare(`
        SELECT
          COUNT(*) as builds_last_24h,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failures_last_24h
        FROM builds
        WHERE started_at >= datetime('now', '-1 day')
      `).get();

      const deployStats = db.prepare(`
        SELECT
          COUNT(*) as total_deploys,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_deploys,
          SUM(CASE WHEN rollback_of IS NOT NULL THEN 1 ELSE 0 END) as rollbacks
        FROM deployments
      `).get();

      const teamActivity = db.prepare(`
        SELECT
          p.team,
          COUNT(b.id) as builds,
          SUM(CASE WHEN b.status = 'failed' THEN 1 ELSE 0 END) as failures,
          ROUND(100.0 * SUM(CASE WHEN b.status = 'success' THEN 1 ELSE 0 END) / COUNT(b.id), 1) as success_rate
        FROM builds b
        JOIN projects p ON b.project_id = p.id
        GROUP BY p.team
        ORDER BY builds DESC
      `).all();

      const activeIncidents = db.prepare(`
        SELECT COUNT(DISTINCT project_id) as projects_with_incidents
        FROM uptime_checks
        WHERE is_healthy = 0
        AND checked_at >= datetime('now', '-6 hours')
      `).get();

      const failedProjects = db.prepare(`
        SELECT DISTINCT p.name
        FROM builds b
        JOIN projects p ON b.project_id = p.id
        WHERE b.status = 'failed'
        AND b.id = (SELECT MAX(id) FROM builds WHERE project_id = b.project_id)
      `).all();

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            overview: {
              total_projects: projectCount,
              ...buildStats as object,
              ...recentBuilds as object,
              ...deployStats as object,
              ...activeIncidents as object,
            },
            team_activity: teamActivity,
            currently_broken: failedProjects,
          }, null, 2),
        }],
      };
    },
  );
}
