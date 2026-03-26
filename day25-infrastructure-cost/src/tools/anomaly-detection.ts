import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerAnomalyDetection(server: McpServer) {
  server.tool(
    'anomaly_detection',
    'View detected cost anomalies — spikes, unusual patterns, and unresolved issues. Filter by severity, provider, or resolution status.',
    {
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      resolved: z.boolean().optional().describe('Filter by resolution status'),
      provider: z.string().optional().describe('Filter by provider name'),
    },
    async (params) => {
      let sql = `
        SELECT a.*, s.name as service_name, s.category, p.name as provider_name
        FROM anomalies a
        JOIN services s ON a.service_id = s.id
        JOIN providers p ON s.provider_id = p.id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.severity) {
        sql += ' AND a.severity = ?';
        args.push(params.severity);
      }
      if (params.resolved !== undefined) {
        sql += ' AND a.resolved = ?';
        args.push(params.resolved ? 1 : 0);
      }
      if (params.provider) {
        sql += ' AND p.name LIKE ?';
        args.push(`%${params.provider}%`);
      }

      sql += ' ORDER BY a.date DESC';

      const anomalies = db.prepare(sql).all(...args) as Array<{
        id: number; service_id: number; date: string; expected_amount: number;
        actual_amount: number; deviation_pct: number; severity: string;
        resolved: number; notes: string; service_name: string; category: string;
        provider_name: string;
      }>;

      const totalImpact = anomalies.reduce((sum, a) => sum + (a.actual_amount - a.expected_amount), 0);
      const unresolved = anomalies.filter(a => !a.resolved);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            total_anomalies: anomalies.length,
            unresolved_count: unresolved.length,
            total_cost_impact: Math.round(totalImpact * 100) / 100,
            anomalies: anomalies.map(a => ({
              date: a.date,
              provider: a.provider_name,
              service: a.service_name,
              category: a.category,
              severity: a.severity,
              expected: a.expected_amount,
              actual: a.actual_amount,
              deviation_pct: a.deviation_pct,
              resolved: Boolean(a.resolved),
              notes: a.notes,
            })),
          }, null, 2),
        }],
      };
    },
  );
}
