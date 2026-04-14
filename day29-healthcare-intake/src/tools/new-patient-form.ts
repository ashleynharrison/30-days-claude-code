import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

// Very lightweight clinical flag rules — NOT medical advice, this is demo logic.
function computeFlags(form: {
  symptoms?: string | null;
  medical_history?: string | null;
  family_history?: string | null;
  current_medications?: string | null;
  form_type: string;
}): string[] {
  const flags: string[] = [];
  const text = [form.symptoms, form.medical_history, form.family_history].filter(Boolean).join(' ').toLowerCase();

  if (/chest (pain|tightness|pressure)|shortness of breath|exertion/.test(text)) {
    flags.push('exertional_symptoms', 'urgent_review');
  }
  if (/diabetes|metformin|insulin|bg .* high/.test(text)) flags.push('diabetes');
  if (/hypertension|high blood pressure|lisinopril|amlodipine/.test(text)) flags.push('hypertension');
  if (/mole|lesion|skin change/.test(text)) flags.push('skin_lesion_change');
  if (/cancer|melanoma|tumor/.test(text)) flags.push('family_hx_cancer');
  if (/anxiety|depression|sertraline|ssri/.test(text)) flags.push('mental_health');
  if (/pregnan|prenatal|obstetric/.test(text)) flags.push('pregnancy');
  if (form.current_medications && form.current_medications.split(',').length >= 4) flags.push('polypharmacy');
  if (/warfarin|anticoag|eliquis|xarelto/.test((form.current_medications || '').toLowerCase())) flags.push('anticoagulation');
  if (/forget|cognit|memory|dementia|alzheimer/.test(text)) flags.push('cognitive_concern');

  return Array.from(new Set(flags));
}

export function registerNewPatientForm(server: McpServer) {
  server.tool(
    'new_patient_form',
    'Create or update a patient intake form. Auto-computes clinical flags (urgent review triggers, chronic conditions, etc.) based on submitted history.',
    {
      patient: z.string().describe('Patient name or email'),
      form_type: z.enum(['new_patient', 'annual_update', 'specialist_referral']).describe('Form type'),
      reason_for_visit: z.string().optional(),
      symptoms: z.string().optional(),
      current_medications: z.string().optional().describe('Comma-separated list'),
      allergies: z.string().optional(),
      medical_history: z.string().optional(),
      family_history: z.string().optional(),
      submit: z.boolean().optional().describe('If true, marks form as submitted (not just in_progress)'),
    },
    async (params) => {
      const patient = db.prepare(`
        SELECT * FROM patients
        WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR (first_name || ' ' || last_name) LIKE ?
      `).get(
        `%${params.patient}%`, `%${params.patient}%`, `%${params.patient}%`, `%${params.patient}%`
      ) as Record<string, unknown> | undefined;

      if (!patient) {
        return { content: [{ type: 'text' as const, text: `No patient found matching "${params.patient}".` }] };
      }

      const flags = computeFlags({
        symptoms: params.symptoms,
        medical_history: params.medical_history,
        family_history: params.family_history,
        current_medications: params.current_medications,
        form_type: params.form_type,
      });

      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const status = params.submit ? 'submitted' : 'in_progress';
      const submitted_at = params.submit ? now : null;

      const result = db.prepare(`
        INSERT INTO intake_forms (
          patient_id, form_type, status, reason_for_visit, symptoms,
          current_medications, allergies, medical_history, family_history,
          started_at, submitted_at, flags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        patient.id, params.form_type, status,
        params.reason_for_visit ?? null, params.symptoms ?? null,
        params.current_medications ?? null, params.allergies ?? null,
        params.medical_history ?? null, params.family_history ?? null,
        now, submitted_at, JSON.stringify(flags),
      );

      const formId = result.lastInsertRowid as number;

      db.prepare(`
        INSERT INTO intake_activity (patient_id, intake_form_id, action, details, actor, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        patient.id, formId, params.submit ? 'form_submitted' : 'form_started',
        `${params.form_type} form ${params.submit ? 'submitted' : 'started'}.`,
        `${patient.first_name} ${patient.last_name}`, now,
      );

      if (flags.includes('urgent_review')) {
        db.prepare(`
          INSERT INTO intake_activity (patient_id, intake_form_id, action, details, actor, created_at)
          VALUES (?, ?, 'flag_raised', ?, 'System', ?)
        `).run(patient.id, formId, `Urgent review flags: ${flags.join(', ')}.`, now);
      }

      const created = db.prepare('SELECT * FROM intake_forms WHERE id = ?').get(formId) as Record<string, unknown>;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            form: created,
            computed_flags: flags,
            urgent: flags.includes('urgent_review'),
            next_steps: [
              !params.submit ? 'Complete remaining fields and submit.' : 'Form is queued for clinical review.',
              flags.includes('urgent_review') ? 'Flagged for urgent review — provider will be notified.' : null,
              'Verify insurance before appointment.',
              'Ensure HIPAA + treatment consents are signed.',
            ].filter(Boolean),
          }, null, 2),
        }],
      };
    },
  );
}
