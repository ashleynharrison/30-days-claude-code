import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerGetProposal(server: McpServer) {
  server.tool(
    'get_proposal',
    'Get the full proposal document with all sections, line items, and client details. Returns the complete proposal ready for review or editing.',
    {
      proposal_id: z.number().describe('Proposal ID to retrieve'),
    },
    async ({ proposal_id }) => {
      const proposal = db.prepare(`
        SELECT p.*, c.name as client_name, c.company, c.email as client_email, c.industry, c.budget_range,
               t.name as template_name, t.type as template_type, t.tone
        FROM proposals p
        JOIN clients c ON c.id = p.client_id
        LEFT JOIN templates t ON t.id = p.template_id
        WHERE p.id = ?
      `).get(proposal_id) as any;

      if (!proposal) {
        return { content: [{ type: 'text' as const, text: 'Proposal not found.' }] };
      }

      const sections = db.prepare(`
        SELECT * FROM proposal_sections WHERE proposal_id = ? ORDER BY section_order
      `).all(proposal_id) as any[];

      const lineItems = db.prepare(`
        SELECT li.*, s.name as service_name, s.category
        FROM line_items li
        LEFT JOIN services s ON s.id = li.service_id
        WHERE li.proposal_id = ?
      `).all(proposal_id) as any[];

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            proposal: {
              id: proposal.id,
              title: proposal.title,
              status: proposal.status,
              created_at: proposal.created_at,
              sent_at: proposal.sent_at,
              accepted_at: proposal.accepted_at,
            },
            client: {
              name: proposal.client_name,
              company: proposal.company,
              email: proposal.client_email,
              industry: proposal.industry,
              budget_range: proposal.budget_range,
            },
            template: {
              name: proposal.template_name,
              type: proposal.template_type,
              tone: proposal.tone,
            },
            brief: proposal.brief,
            sections: sections.map((s) => ({
              order: s.section_order,
              title: s.title,
              type: s.section_type,
              content: s.content,
            })),
            line_items: lineItems.map((li) => ({
              service: li.service_name || li.description,
              category: li.category,
              description: li.description,
              hours: li.hours,
              rate: `$${li.rate}`,
              subtotal: `$${li.subtotal.toLocaleString()}`,
            })),
            totals: {
              hours: proposal.total_hours,
              cost: `$${proposal.total_cost.toLocaleString()}`,
              timeline: `${proposal.timeline_weeks} weeks`,
            },
          }, null, 2),
        }],
      };
    }
  );
}
