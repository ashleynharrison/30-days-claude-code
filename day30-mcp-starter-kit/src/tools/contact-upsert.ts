// Pattern: Create-or-update with optimistic logic. If a contact with the
// given email exists, update it. Otherwise insert. Always write to the
// activity log — future-you will thank present-you for the audit trail.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerContactUpsert(server: McpServer) {
  server.tool(
    'contact_upsert',
    'Create a new contact or update an existing one (matched by email). Writes to the activity log automatically.',
    {
      name: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      company: z.string().optional(),
      status: z.enum(['active', 'paused', 'archived']).optional(),
      tags: z.array(z.string()).optional(),
      notes: z.string().optional(),
    },
    async ({ name, email, phone, company, status, tags, notes }) => {
      const existing = db.prepare(`SELECT * FROM contacts WHERE email = ?`).get(email) as Record<string, unknown> | undefined;

      if (existing) {
        db.prepare(`
          UPDATE contacts
          SET name = ?, phone = COALESCE(?, phone), company = COALESCE(?, company),
              status = COALESCE(?, status), tags = COALESCE(?, tags), notes = COALESCE(?, notes)
          WHERE id = ?
        `).run(name, phone ?? null, company ?? null, status ?? null,
               tags ? JSON.stringify(tags) : null, notes ?? null, existing.id);

        db.prepare(`
          INSERT INTO activity (contact_id, action, details, actor)
          VALUES (?, 'contact_updated', ?, 'mcp')
        `).run(existing.id, `Fields updated via MCP`);

        const updated = db.prepare(`SELECT * FROM contacts WHERE id = ?`).get(existing.id);
        return { content: [{ type: 'text' as const, text: JSON.stringify({ action: 'updated', contact: updated }, null, 2) }] };
      }

      const result = db.prepare(`
        INSERT INTO contacts (name, email, phone, company, status, tags, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(name, email, phone ?? null, company ?? null, status ?? 'active',
             tags ? JSON.stringify(tags) : null, notes ?? null);

      const id = result.lastInsertRowid as number;
      db.prepare(`
        INSERT INTO activity (contact_id, action, details, actor)
        VALUES (?, 'contact_created', 'Created via MCP', 'mcp')
      `).run(id);

      const created = db.prepare(`SELECT * FROM contacts WHERE id = ?`).get(id);
      return { content: [{ type: 'text' as const, text: JSON.stringify({ action: 'created', contact: created }, null, 2) }] };
    },
  );
}
