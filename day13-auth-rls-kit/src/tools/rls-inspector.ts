import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerRLSInspector(server: McpServer) {
  server.tool(
    'rls_inspector',
    'Inspect Row Level Security policies for a project — view USING/CHECK expressions, find unprotected tables, and check policy coverage',
    {
      project_name: z.string().describe('Project name (partial match)'),
      table_name: z.string().optional().describe('Filter by table name'),
      operation: z.string().optional().describe('Filter by operation (SELECT, INSERT, UPDATE, DELETE)'),
    },
    async ({ project_name, table_name, operation }) => {
      const project = db.prepare(`SELECT * FROM projects WHERE name LIKE ?`).get(`%${project_name}%`) as any;
      if (!project) {
        return { content: [{ type: 'text' as const, text: `No project found matching "${project_name}".` }] };
      }

      let query = `SELECT * FROM rls_policies WHERE project_id = ?`;
      const params: any[] = [project.id];

      if (table_name) {
        query += ` AND table_name = ?`;
        params.push(table_name);
      }
      if (operation) {
        query += ` AND operation = ?`;
        params.push(operation.toUpperCase());
      }

      query += ` ORDER BY table_name, operation`;

      const policies = db.prepare(query).all(...params) as any[];

      // Group by table
      const byTable: Record<string, any[]> = {};
      for (const p of policies) {
        if (!byTable[p.table_name]) byTable[p.table_name] = [];
        byTable[p.table_name].push({
          policy_name: p.policy_name,
          operation: p.operation,
          role: p.role_name,
          using_expression: p.using_expression,
          check_expression: p.check_expression,
          description: p.description,
          enabled: !!p.enabled,
        });
      }

      // Coverage analysis
      const tables = Object.keys(byTable);
      const ops = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
      const coverage: any[] = [];
      for (const tbl of tables) {
        const tablePolicies = byTable[tbl];
        const coveredOps = [...new Set(tablePolicies.map((p) => p.operation))];
        const missingOps = ops.filter((o) => !coveredOps.includes(o));
        const disabledCount = tablePolicies.filter((p) => !p.enabled).length;

        coverage.push({
          table: tbl,
          policies_count: tablePolicies.length,
          operations_covered: coveredOps,
          operations_missing: missingOps,
          disabled_policies: disabledCount,
          fully_protected: missingOps.length === 0 && disabledCount === 0,
        });
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            project: project.name,
            summary: {
              total_policies: policies.length,
              tables_with_rls: tables.length,
              fully_protected_tables: coverage.filter((c) => c.fully_protected).length,
            },
            coverage,
            policies_by_table: byTable,
          }, null, 2),
        }],
      };
    }
  );
}
