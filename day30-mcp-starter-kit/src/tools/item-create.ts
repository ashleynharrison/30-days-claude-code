// Pattern: Create a child record linked to a parent. Resolve the parent by
// any identifier (name / email / id) so the LLM doesn't have to know ids.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerItemCreate(server: McpServer) {
  server.tool(
    'item_create',
    'Create a new item (task, engagement, appointment — whatever you mapped it to) under a contact. Resolves the contact by name, email, or id.',
    {
      contact: z.string().describe('Contact name, email, or id'),
      title: z.string(),
      category: z.string().optional(),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
      due_date: z.string().optional().describe('YYYY-MM-DD'),
      assignee: z.string().optional(),
      metadata: z.record(z.unknown()).optional(),
    },
    async ({ contact, title, category, priority, due_date, assignee, metadata }) => {
      const like = `%${contact}%`;
      const row = db.prepare(`
        SELECT id, name FROM contacts
        WHERE name LIKE ? OR email LIKE ? OR CAST(id AS TEXT) = ?
        LIMIT 1
      `).get(like, like, contact) as { id: number; name: string } | undefined;

      if (!row) {
        return { content: [{ type: 'text' as const, text: `No contact found matching "${contact}".` }] };
      }

      const result = db.prepare(`
        INSERT INTO items (contact_id, title, category, priority, due_date, assignee, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(row.id, title, category ?? null, priority ?? 'normal',
             due_date ?? null, assignee ?? null,
             metadata ? JSON.stringify(metadata) : null);

      const id = result.lastInsertRowid as number;
      db.prepare(`
        INSERT INTO activity (contact_id, item_id, action, details, actor)
        VALUES (?, ?, 'item_created', ?, 'mcp')
      `).run(row.id, id, `Created "${title}"`);

      const created = db.prepare(`SELECT * FROM items WHERE id = ?`).get(id);
      return { content: [{ type: 'text' as const, text: JSON.stringify({ contact: row.name, item: created }, null, 2) }] };
    },
  );
}
