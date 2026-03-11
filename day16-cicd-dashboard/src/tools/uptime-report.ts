import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerUptimeReport(server: McpServer) {
  server.tool(
    'uptime_report',
    'Uptime and response time report for deployed services over the last 24 hours. Shows availability percentage, average response time, and any incidents.',
    {
      project: z.string().optional().describe('Filter by project name'),
    },
    async (params) => {
      let sql = `
        SELECT
          p.name as project,
          u.environment,
          COUNT(*) as total_checks,
          SUM(CASE WHEN u.is_healthy = 1 THEN 1 ELSE 0 END) as healthy_checks,
          ROUND(100.0 * SUM(CASE WHEN u.is_healthy = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as uptime_pct,
          ROUND(AVG(CASE WHEN u.is_healthy = 1 THEN u.response_time_ms END), 0) as avg_response_ms,
          MAX(CASE WHEN u.is_healthy = 1 THEN u.response_time_ms END) as max_response_ms,
          MIN(CASE WHEN u.is_healthy = 1 THEN u.response_time_ms END) as min_response_ms
        FROM uptime_checks u
        JOIN projects p ON u.project_id = p.id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.project) {
        sql += ' AND p.name LIKE ?';
        args.push(`%${params.project}%`);
      }

      sql += ' GROUP BY p.id, u.environment ORDER BY uptime_pct ASC';

      const rows = db.prepare(sql).all(...args);

      // Get incidents (unhealthy checks)
      let incidentSql = `
        SELECT p.name as project, u.environment, u.checked_at, u.status_code, u.response_time_ms
        FROM uptime_checks u
        JOIN projects p ON u.project_id = p.id
        WHERE u.is_healthy = 0
      `;
      const incidentArgs: unknown[] = [];

      if (params.project) {
        incidentSql += ' AND p.name LIKE ?';
        incidentArgs.push(`%${params.project}%`);
      }

      incidentSql += ' ORDER BY u.checked_at DESC';

      const incidents = db.prepare(incidentSql).all(...incidentArgs);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            uptime_summary: rows,
            incidents,
            incident_count: (incidents as unknown[]).length,
          }, null, 2),
        }],
      };
    },
  );
}
