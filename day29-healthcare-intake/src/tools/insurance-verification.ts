import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerInsuranceVerification(server: McpServer) {
  server.tool(
    'insurance_verification',
    'Check insurance verification across patients — find pending, denied, or expired coverage; see verified plans with copay and deductible data.',
    {
      status: z.enum(['pending', 'verified', 'denied', 'expired']).optional().describe('Filter by verification status'),
      patient: z.string().optional().describe('Filter by patient name or email'),
      provider: z.string().optional().describe('Filter by insurance provider'),
    },
    async (params) => {
      let sql = `
        SELECT i.*, p.first_name, p.last_name, p.email, p.phone
        FROM insurance i
        JOIN patients p ON i.patient_id = p.id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.status) {
        sql += ' AND i.verification_status = ?';
        args.push(params.status);
      }
      if (params.patient) {
        sql += ' AND (p.first_name LIKE ? OR p.last_name LIKE ? OR p.email LIKE ? OR (p.first_name || \' \' || p.last_name) LIKE ?)';
        args.push(`%${params.patient}%`, `%${params.patient}%`, `%${params.patient}%`, `%${params.patient}%`);
      }
      if (params.provider) {
        sql += ' AND i.provider LIKE ?';
        args.push(`%${params.provider}%`);
      }

      sql += ` ORDER BY
        CASE i.verification_status
          WHEN 'denied' THEN 1
          WHEN 'pending' THEN 2
          WHEN 'expired' THEN 3
          WHEN 'verified' THEN 4
        END, i.effective_date DESC`;

      const records = db.prepare(sql).all(...args) as Array<Record<string, unknown>>;

      const today = new Date().toISOString().slice(0, 10);
      const needsAttention = records.filter((r) => {
        const status = r.verification_status as string;
        const term = r.termination_date as string | null;
        return status === 'pending' || status === 'denied' || (term && term < today);
      });

      const summary = {
        total: records.length,
        verified: records.filter((r) => r.verification_status === 'verified').length,
        pending: records.filter((r) => r.verification_status === 'pending').length,
        denied: records.filter((r) => r.verification_status === 'denied').length,
        expired: records.filter((r) => r.verification_status === 'expired').length,
        needs_attention: needsAttention.length,
      };

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ summary, needs_attention: needsAttention, records }, null, 2),
        }],
      };
    },
  );
}
