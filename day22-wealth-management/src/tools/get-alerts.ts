import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerGetAlerts(server: McpServer) {
  server.tool(
    'get_alerts',
    'Get portfolio alerts — concentration warnings, rebalance triggers, RMD deadlines, contribution reminders, and performance flags. Filter by client, severity, or resolution status.',
    {
      client_id: z.number().optional().describe('Filter by client ID'),
      severity: z.string().optional().describe('Filter by severity: info, warning, critical'),
      include_resolved: z.boolean().optional().describe('Include resolved alerts (default: false)'),
    },
    async ({ client_id, severity, include_resolved }) => {
      let query = `
        SELECT al.*, c.name as client_name, a.name as account_name
        FROM alerts al
        JOIN clients c ON c.id = al.client_id
        LEFT JOIN accounts a ON a.id = al.account_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (client_id) {
        query += ` AND al.client_id = ?`;
        params.push(client_id);
      }
      if (severity) {
        query += ` AND al.severity = ?`;
        params.push(severity);
      }
      if (!include_resolved) {
        query += ` AND al.resolved = 0`;
      }

      query += ` ORDER BY CASE al.severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 ELSE 2 END, al.created_at DESC`;

      const alerts = db.prepare(query).all(...params) as any[];

      if (alerts.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No alerts found matching your criteria.' }] };
      }

      // Summarize
      const bySeverity: Record<string, number> = {};
      const byType: Record<string, number> = {};
      for (const al of alerts) {
        bySeverity[al.severity] = (bySeverity[al.severity] || 0) + 1;
        byType[al.type] = (byType[al.type] || 0) + 1;
      }

      const result = alerts.map((al) => ({
        id: al.id,
        client: al.client_name,
        account: al.account_name,
        type: al.type,
        severity: al.severity,
        message: al.message,
        resolved: al.resolved === 1,
        created_at: al.created_at,
        resolved_at: al.resolved_at,
      }));

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            summary: {
              total: result.length,
              by_severity: bySeverity,
              by_type: byType,
            },
            alerts: result,
          }, null, 2),
        }],
      };
    }
  );
}
