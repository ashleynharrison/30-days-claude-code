import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerIntakeQueue(server: McpServer) {
  server.tool(
    'intake_queue',
    'Front-desk queue dashboard — forms awaiting review, urgent-flagged patients, today\'s arrivals, insurance holds, and the readiness of every upcoming appointment.',
    {
      view: z.enum(['all', 'urgent', 'awaiting_review', 'today', 'not_ready']).optional().describe('Which slice of the queue to return'),
    },
    async (params) => {
      const view = params.view ?? 'all';

      const awaitingReview = db.prepare(`
        SELECT f.id, f.form_type, f.status, f.flags, f.submitted_at,
               p.id AS patient_id, p.first_name, p.last_name, p.phone
        FROM intake_forms f
        JOIN patients p ON f.patient_id = p.id
        WHERE f.status = 'submitted'
        ORDER BY f.submitted_at ASC
      `).all() as Array<Record<string, unknown>>;

      const urgent = db.prepare(`
        SELECT f.id, f.form_type, f.status, f.flags, f.submitted_at, f.reason_for_visit,
               p.id AS patient_id, p.first_name, p.last_name, p.phone
        FROM intake_forms f
        JOIN patients p ON f.patient_id = p.id
        WHERE f.flags LIKE '%urgent_review%'
        ORDER BY f.submitted_at DESC
      `).all() as Array<Record<string, unknown>>;

      const todayArrivals = db.prepare(`
        SELECT a.*, p.first_name, p.last_name, p.phone
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        WHERE date(a.scheduled_at) = date('now')
          AND a.status IN ('scheduled','confirmed','checked_in')
        ORDER BY a.scheduled_at ASC
      `).all() as Array<Record<string, unknown>>;

      // "Not ready" = upcoming appointment where patient is missing insurance verification,
      // HIPAA/treatment consent, or has an unsubmitted form.
      const upcoming = db.prepare(`
        SELECT a.id AS appointment_id, a.scheduled_at, a.provider, a.appointment_type, a.status,
               p.id AS patient_id, p.first_name, p.last_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        WHERE a.scheduled_at >= datetime('now')
          AND a.status IN ('scheduled','confirmed')
        ORDER BY a.scheduled_at ASC
      `).all() as Array<Record<string, unknown>>;

      const notReady: Array<Record<string, unknown>> = [];
      for (const apt of upcoming) {
        const pid = apt.patient_id;
        const ins = db.prepare(`SELECT verification_status FROM insurance WHERE patient_id = ? ORDER BY verified_at DESC LIMIT 1`).get(pid) as { verification_status: string } | undefined;
        const hipaa = db.prepare(`SELECT status FROM consents WHERE patient_id = ? AND consent_type='hipaa_privacy' ORDER BY id DESC LIMIT 1`).get(pid) as { status: string } | undefined;
        const treat = db.prepare(`SELECT status FROM consents WHERE patient_id = ? AND consent_type='treatment' ORDER BY id DESC LIMIT 1`).get(pid) as { status: string } | undefined;
        const form = db.prepare(`SELECT status FROM intake_forms WHERE patient_id = ? ORDER BY started_at DESC LIMIT 1`).get(pid) as { status: string } | undefined;

        const issues: string[] = [];
        if (!ins || ins.verification_status !== 'verified') issues.push('insurance_not_verified');
        if (!hipaa || hipaa.status !== 'signed') issues.push('hipaa_missing');
        if (!treat || treat.status !== 'signed') issues.push('treatment_consent_missing');
        if (!form || !['submitted', 'reviewed', 'completed'].includes(form.status)) issues.push('intake_form_incomplete');

        if (issues.length > 0) {
          notReady.push({ ...apt, issues });
        }
      }

      const insurancePending = db.prepare(`
        SELECT i.provider, i.verification_status, i.notes,
               p.first_name, p.last_name, p.phone
        FROM insurance i
        JOIN patients p ON i.patient_id = p.id
        WHERE i.verification_status IN ('pending','denied')
        ORDER BY i.verification_status
      `).all() as Array<Record<string, unknown>>;

      const payload = {
        snapshot: {
          awaiting_review: awaitingReview.length,
          urgent_flags: urgent.length,
          today_arrivals: todayArrivals.length,
          insurance_holds: insurancePending.length,
          appointments_not_ready: notReady.length,
        },
        ...(view === 'all' || view === 'awaiting_review' ? { awaiting_review: awaitingReview } : {}),
        ...(view === 'all' || view === 'urgent' ? { urgent } : {}),
        ...(view === 'all' || view === 'today' ? { today_arrivals: todayArrivals } : {}),
        ...(view === 'all' || view === 'not_ready' ? { appointments_not_ready: notReady } : {}),
        ...(view === 'all' ? { insurance_holds: insurancePending } : {}),
      };

      return { content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }] };
    },
  );
}
