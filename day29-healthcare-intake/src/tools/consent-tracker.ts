import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerConsentTracker(server: McpServer) {
  server.tool(
    'consent_tracker',
    'Track consent and compliance documents across patients — HIPAA, treatment, telehealth, release-of-records, and financial. Surfaces pending, expired, or missing consents.',
    {
      status: z.enum(['pending', 'signed', 'declined', 'expired']).optional(),
      consent_type: z.enum(['hipaa_privacy', 'treatment', 'telehealth', 'release_of_records', 'financial']).optional(),
      patient: z.string().optional(),
      expiring_within_days: z.number().optional().describe('Show consents expiring within N days'),
    },
    async (params) => {
      let sql = `
        SELECT c.*, p.first_name, p.last_name, p.email
        FROM consents c
        JOIN patients p ON c.patient_id = p.id
        WHERE 1=1
      `;
      const args: unknown[] = [];

      if (params.status) { sql += ' AND c.status = ?'; args.push(params.status); }
      if (params.consent_type) { sql += ' AND c.consent_type = ?'; args.push(params.consent_type); }
      if (params.patient) {
        sql += ' AND (p.first_name LIKE ? OR p.last_name LIKE ? OR (p.first_name || \' \' || p.last_name) LIKE ?)';
        args.push(`%${params.patient}%`, `%${params.patient}%`, `%${params.patient}%`);
      }
      if (params.expiring_within_days) {
        sql += ` AND c.expires_at IS NOT NULL AND c.expires_at <= date('now', '+' || ? || ' days') AND c.expires_at >= date('now')`;
        args.push(params.expiring_within_days);
      }

      sql += ` ORDER BY
        CASE c.status WHEN 'pending' THEN 1 WHEN 'expired' THEN 2 WHEN 'declined' THEN 3 ELSE 4 END,
        c.expires_at ASC`;

      const consents = db.prepare(sql).all(...args) as Array<Record<string, unknown>>;

      // Which patients are missing required consents (hipaa_privacy + treatment)?
      const missingRequired = db.prepare(`
        SELECT p.id, p.first_name, p.last_name, p.email,
               (SELECT status FROM consents WHERE patient_id = p.id AND consent_type = 'hipaa_privacy' ORDER BY id DESC LIMIT 1) AS hipaa_status,
               (SELECT status FROM consents WHERE patient_id = p.id AND consent_type = 'treatment' ORDER BY id DESC LIMIT 1) AS treatment_status
        FROM patients p
      `).all() as Array<Record<string, unknown>>;

      const incomplete = missingRequired.filter((p) => p.hipaa_status !== 'signed' || p.treatment_status !== 'signed');

      const summary = {
        total_results: consents.length,
        patients_missing_required_consents: incomplete.length,
        by_status: {} as Record<string, number>,
      };
      for (const c of consents) {
        summary.by_status[c.status as string] = (summary.by_status[c.status as string] || 0) + 1;
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ summary, patients_missing_required: incomplete, consents }, null, 2),
        }],
      };
    },
  );
}
