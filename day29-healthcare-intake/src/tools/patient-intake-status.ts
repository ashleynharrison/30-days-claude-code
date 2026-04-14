import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerPatientIntakeStatus(server: McpServer) {
  server.tool(
    'patient_intake_status',
    'Full intake status for a patient — demographics, intake form, insurance verification, consents, upcoming appointments, and activity log.',
    {
      patient: z.string().describe('Patient name, email, or partial match'),
    },
    async (params) => {
      const patient = db.prepare(`
        SELECT * FROM patients
        WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
           OR (first_name || ' ' || last_name) LIKE ?
      `).get(
        `%${params.patient}%`, `%${params.patient}%`, `%${params.patient}%`, `%${params.patient}%`
      ) as Record<string, unknown> | undefined;

      if (!patient) {
        return { content: [{ type: 'text' as const, text: `No patient found matching "${params.patient}".` }] };
      }

      const forms = db.prepare(`
        SELECT id, form_type, status, reason_for_visit, flags, started_at, submitted_at, reviewed_at, reviewed_by
        FROM intake_forms WHERE patient_id = ? ORDER BY started_at DESC
      `).all(patient.id) as Array<Record<string, unknown>>;

      const insurance = db.prepare(`
        SELECT provider, plan_type, policy_number, verification_status, verified_at, copay, deductible_met, deductible_total, effective_date, termination_date, notes
        FROM insurance WHERE patient_id = ? ORDER BY verification_status DESC, effective_date DESC
      `).all(patient.id) as Array<Record<string, unknown>>;

      const consents = db.prepare(`
        SELECT consent_type, status, signed_at, signed_by, expires_at, document_version, notes
        FROM consents WHERE patient_id = ? ORDER BY consent_type
      `).all(patient.id) as Array<Record<string, unknown>>;

      const appointments = db.prepare(`
        SELECT id, provider, appointment_type, scheduled_at, duration_minutes, status, location, notes
        FROM appointments WHERE patient_id = ? ORDER BY scheduled_at DESC LIMIT 10
      `).all(patient.id) as Array<Record<string, unknown>>;

      const activity = db.prepare(`
        SELECT action, details, actor, created_at
        FROM intake_activity WHERE patient_id = ? ORDER BY created_at DESC LIMIT 10
      `).all(patient.id) as Array<Record<string, unknown>>;

      const readinessChecks = {
        has_submitted_form: forms.some((f) => ['submitted', 'reviewed', 'completed'].includes(f.status as string)),
        insurance_verified: insurance.some((i) => i.verification_status === 'verified'),
        hipaa_signed: consents.some((c) => c.consent_type === 'hipaa_privacy' && c.status === 'signed'),
        treatment_consent_signed: consents.some((c) => c.consent_type === 'treatment' && c.status === 'signed'),
        has_upcoming_appointment: appointments.some((a) => ['scheduled', 'confirmed'].includes(a.status as string)),
      };

      const ready_to_see =
        readinessChecks.has_submitted_form &&
        readinessChecks.insurance_verified &&
        readinessChecks.hipaa_signed &&
        readinessChecks.treatment_consent_signed;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            patient,
            intake_forms: forms,
            insurance,
            consents,
            appointments,
            recent_activity: activity,
            readiness: { ...readinessChecks, ready_to_see },
          }, null, 2),
        }],
      };
    },
  );
}
