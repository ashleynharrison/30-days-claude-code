import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerAppointmentScheduler(server: McpServer) {
  server.tool(
    'appointment_scheduler',
    'Schedule, view, and manage appointments. Filter upcoming appointments by provider, status, type, or date range. Surfaces unconfirmed bookings and no-shows.',
    {
      action: z.enum(['list', 'schedule', 'cancel', 'confirm']).describe('What to do'),
      patient: z.string().optional().describe('Patient name or email (required for schedule/cancel/confirm)'),
      provider: z.string().optional().describe('Filter by provider or assign provider when scheduling'),
      appointment_type: z.enum(['new_patient', 'follow_up', 'annual', 'consultation', 'telehealth']).optional(),
      scheduled_at: z.string().optional().describe('Date/time for new appointment (YYYY-MM-DD HH:MM)'),
      duration_minutes: z.number().optional().describe('Duration of new appointment'),
      appointment_id: z.number().optional().describe('Appointment ID for cancel/confirm'),
      status: z.string().optional().describe('Filter list by status'),
      upcoming_only: z.boolean().optional().describe('Only show appointments scheduled after today'),
    },
    async (params) => {
      if (params.action === 'list') {
        let sql = `
          SELECT a.*, p.first_name, p.last_name, p.phone
          FROM appointments a
          JOIN patients p ON a.patient_id = p.id
          WHERE 1=1
        `;
        const args: unknown[] = [];

        if (params.patient) {
          sql += ' AND (p.first_name LIKE ? OR p.last_name LIKE ? OR (p.first_name || \' \' || p.last_name) LIKE ?)';
          args.push(`%${params.patient}%`, `%${params.patient}%`, `%${params.patient}%`);
        }
        if (params.provider) {
          sql += ' AND a.provider LIKE ?';
          args.push(`%${params.provider}%`);
        }
        if (params.appointment_type) {
          sql += ' AND a.appointment_type = ?';
          args.push(params.appointment_type);
        }
        if (params.status) {
          sql += ' AND a.status = ?';
          args.push(params.status);
        }
        if (params.upcoming_only) {
          sql += " AND a.scheduled_at >= datetime('now')";
        }

        sql += ' ORDER BY a.scheduled_at ASC';

        const appointments = db.prepare(sql).all(...args) as Array<Record<string, unknown>>;
        const summary = {
          total: appointments.length,
          by_status: {} as Record<string, number>,
          by_provider: {} as Record<string, number>,
        };
        for (const a of appointments) {
          summary.by_status[a.status as string] = (summary.by_status[a.status as string] || 0) + 1;
          summary.by_provider[a.provider as string] = (summary.by_provider[a.provider as string] || 0) + 1;
        }
        return { content: [{ type: 'text' as const, text: JSON.stringify({ summary, appointments }, null, 2) }] };
      }

      if (params.action === 'schedule') {
        if (!params.patient || !params.provider || !params.scheduled_at || !params.appointment_type) {
          return { content: [{ type: 'text' as const, text: 'schedule requires patient, provider, scheduled_at, and appointment_type.' }] };
        }
        const patient = db.prepare(`
          SELECT id FROM patients WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR (first_name || ' ' || last_name) LIKE ?
        `).get(`%${params.patient}%`, `%${params.patient}%`, `%${params.patient}%`, `%${params.patient}%`) as { id: number } | undefined;
        if (!patient) return { content: [{ type: 'text' as const, text: `No patient found matching "${params.patient}".` }] };

        const conflict = db.prepare(`
          SELECT id, scheduled_at FROM appointments
          WHERE provider = ? AND scheduled_at = ? AND status != 'cancelled'
        `).get(params.provider, params.scheduled_at);
        if (conflict) {
          return { content: [{ type: 'text' as const, text: `Conflict — ${params.provider} already has an appointment at ${params.scheduled_at}.` }] };
        }

        const result = db.prepare(`
          INSERT INTO appointments (patient_id, provider, appointment_type, scheduled_at, duration_minutes, status)
          VALUES (?, ?, ?, ?, ?, 'scheduled')
        `).run(patient.id, params.provider, params.appointment_type, params.scheduled_at, params.duration_minutes ?? 30);

        db.prepare(`
          INSERT INTO intake_activity (patient_id, action, details, actor) VALUES (?, 'appointment_scheduled', ?, 'Front Desk')
        `).run(patient.id, `${params.appointment_type} with ${params.provider} at ${params.scheduled_at}.`);

        const apt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);
        return { content: [{ type: 'text' as const, text: JSON.stringify({ scheduled: apt }, null, 2) }] };
      }

      if (params.action === 'cancel' || params.action === 'confirm') {
        if (!params.appointment_id) {
          return { content: [{ type: 'text' as const, text: `${params.action} requires appointment_id.` }] };
        }
        const newStatus = params.action === 'cancel' ? 'cancelled' : 'confirmed';
        db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(newStatus, params.appointment_id);
        const apt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(params.appointment_id) as Record<string, unknown> | undefined;
        if (!apt) return { content: [{ type: 'text' as const, text: `No appointment with id ${params.appointment_id}.` }] };
        db.prepare(`
          INSERT INTO intake_activity (patient_id, action, details, actor) VALUES (?, ?, ?, 'Front Desk')
        `).run(apt.patient_id, `appointment_${newStatus}`, `Appointment ${params.appointment_id} ${newStatus}.`);
        return { content: [{ type: 'text' as const, text: JSON.stringify({ updated: apt }, null, 2) }] };
      }

      return { content: [{ type: 'text' as const, text: 'Unknown action.' }] };
    },
  );
}
