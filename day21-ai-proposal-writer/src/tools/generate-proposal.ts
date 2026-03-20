import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerGenerateProposal(server: McpServer) {
  server.tool(
    'generate_proposal',
    'Generate a new proposal from a client brief. Selects appropriate template, recommends services, estimates hours and pricing, and drafts section content.',
    {
      client_id: z.number().describe('Client ID to generate proposal for'),
      brief: z.string().describe('Project brief — what the client needs, their constraints, and goals'),
      template_id: z.number().optional().describe('Template ID to use (auto-selects if not provided)'),
      timeline_weeks: z.number().optional().describe('Desired timeline in weeks'),
    },
    async ({ client_id, brief, template_id, timeline_weeks }) => {
      const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(client_id) as any;
      if (!client) {
        return { content: [{ type: 'text' as const, text: 'Client not found.' }] };
      }

      // Auto-select template based on brief length and keywords
      let template: any;
      if (template_id) {
        template = db.prepare('SELECT * FROM templates WHERE id = ?').get(template_id);
      } else {
        // Simple heuristic: longer briefs = SOW, shorter = quick proposal
        const wordCount = brief.split(/\s+/).length;
        const hasDiscovery = /discover|explore|understand|assess|evaluate/i.test(brief);
        const hasRetainer = /ongoing|monthly|retainer|continuous/i.test(brief);

        if (hasRetainer) {
          template = db.prepare('SELECT * FROM templates WHERE type = ?').get('retainer');
        } else if (hasDiscovery) {
          template = db.prepare('SELECT * FROM templates WHERE type = ?').get('discovery');
        } else if (wordCount > 40) {
          template = db.prepare('SELECT * FROM templates WHERE type = ?').get('sow');
        } else {
          template = db.prepare('SELECT * FROM templates WHERE type = ?').get('proposal');
        }
      }

      // Match services based on brief keywords
      const allServices = db.prepare('SELECT * FROM services').all() as any[];
      const matchedServices: any[] = [];

      const briefLower = brief.toLowerCase();
      for (const svc of allServices) {
        const keywords = svc.name.toLowerCase().split(/\s+/).concat(svc.category.toLowerCase().split(/\s+/));
        const descWords = svc.description.toLowerCase();
        if (keywords.some((k: string) => briefLower.includes(k)) || briefLower.includes(svc.category.toLowerCase())) {
          matchedServices.push(svc);
        }
      }

      // Always include web dev if nothing else matches
      if (matchedServices.length === 0) {
        const webDev = allServices.find((s) => s.name.includes('Web Application'));
        if (webDev) matchedServices.push(webDev);
      }

      // Calculate totals
      let totalHours = 0;
      let totalCost = 0;
      const lineItems = matchedServices.map((svc) => {
        const hours = svc.typical_hours;
        const subtotal = hours * svc.hourly_rate;
        totalHours += hours;
        totalCost += subtotal;
        return {
          service: svc.name,
          hours,
          rate: svc.hourly_rate,
          subtotal,
        };
      });

      const weeks = timeline_weeks || Math.max(2, Math.ceil(totalHours / 25));

      // Create the proposal
      const title = `${client.company} — ${brief.split(/[.!?]/)[0].trim().substring(0, 60)}`;
      const result = db.prepare(`
        INSERT INTO proposals (client_id, template_id, title, status, total_hours, total_cost, timeline_weeks, brief)
        VALUES (?, ?, ?, 'draft', ?, ?, ?, ?)
      `).run(client_id, template.id, title, totalHours, totalCost, weeks, brief);

      const proposalId = result.lastInsertRowid;

      // Insert line items
      const insertLineItem = db.prepare(`INSERT INTO line_items (proposal_id, service_id, description, hours, rate, subtotal) VALUES (?, ?, ?, ?, ?, ?)`);
      for (const svc of matchedServices) {
        insertLineItem.run(proposalId, svc.id, `${svc.name} — ${svc.deliverables.split(',')[0].trim()}`, svc.typical_hours, svc.hourly_rate, svc.typical_hours * svc.hourly_rate);
      }

      // Generate section placeholders based on template
      const sections = JSON.parse(template.sections) as string[];
      const insertSection = db.prepare(`INSERT INTO proposal_sections (proposal_id, section_order, title, content, section_type) VALUES (?, ?, ?, ?, ?)`);

      for (let i = 0; i < sections.length; i++) {
        const sectionTitle = sections[i];
        let content = '';
        let sectionType = 'body';

        if (/summary|overview/i.test(sectionTitle)) {
          content = `${client.company} needs ${brief.split('.')[0].toLowerCase()}. This proposal outlines our approach to delivering a solution that meets ${client.name}'s requirements within ${weeks} weeks.\n\nBased on our understanding of ${client.industry} and the specific needs described, we recommend a phased approach that prioritizes the core functionality first.`;
          sectionType = 'summary';
        } else if (/investment|pricing|cost/i.test(sectionTitle)) {
          content = lineItems.map((li) => `• ${li.service}: ${li.hours} hours × $${li.rate}/hr = $${li.subtotal.toLocaleString()}`).join('\n');
          content += `\n\nTotal: ${totalHours} hours — $${totalCost.toLocaleString()}`;
          sectionType = 'pricing';
        } else if (/timeline|schedule|milestone/i.test(sectionTitle)) {
          content = `Estimated timeline: ${weeks} weeks\n\n`;
          const sprintWeeks = Math.ceil(weeks / 3);
          content += `Phase 1 (Weeks 1–${sprintWeeks}): Foundation — setup, architecture, core infrastructure\n`;
          content += `Phase 2 (Weeks ${sprintWeeks + 1}–${sprintWeeks * 2}): Build — primary features, integrations\n`;
          content += `Phase 3 (Weeks ${sprintWeeks * 2 + 1}–${weeks}): Polish — testing, optimization, launch`;
          sectionType = 'timeline';
        } else if (/scope|solution|build/i.test(sectionTitle)) {
          content = `Based on the brief, the recommended services include:\n\n${matchedServices.map((s) => `• **${s.name}**: ${s.description}`).join('\n\n')}\n\nDeliverables: ${matchedServices.map((s) => s.deliverables).join(', ')}`;
          sectionType = 'scope';
        } else if (/need|understand/i.test(sectionTitle)) {
          content = `${client.name} at ${client.company} (${client.industry}) described the following needs:\n\n"${brief}"\n\nBudget range: ${client.budget_range || 'Not specified'}\nNotes: ${client.notes || 'None'}`;
          sectionType = 'needs';
        } else if (/next|go|start/i.test(sectionTitle)) {
          content = `Ready to move forward? Here's what happens next:\n\n1. Sign this proposal and return the first payment\n2. We'll schedule a kickoff call within 48 hours\n3. You'll get access to a shared project tracker\n4. We start building.\n\nQuestions? Reply to this email or book a call at tellavsn.com.`;
          sectionType = 'cta';
        } else if (/terms|condition/i.test(sectionTitle)) {
          content = `• Payment terms: Net 15 from invoice date\n• Changes to scope will be documented and priced separately\n• All code is yours — full ownership transferred at final payment\n• We offer 30 days of bug-fix support after launch at no extra charge`;
          sectionType = 'terms';
        } else {
          content = `[Draft content for "${sectionTitle}" — to be customized based on ${client.company}'s specific needs]`;
          sectionType = 'body';
        }

        insertSection.run(proposalId, i + 1, sectionTitle, content, sectionType);
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            proposal_id: Number(proposalId),
            title,
            client: { name: client.name, company: client.company, industry: client.industry },
            template: { name: template.name, type: template.type, tone: template.tone },
            scope: {
              services: lineItems,
              total_hours: totalHours,
              total_cost: `$${totalCost.toLocaleString()}`,
              timeline: `${weeks} weeks`,
            },
            sections: sections,
            status: 'draft',
            message: 'Proposal generated. Use get_proposal to see the full document, or edit sections as needed.',
          }, null, 2),
        }],
      };
    }
  );
}
