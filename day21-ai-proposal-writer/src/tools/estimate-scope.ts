import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerEstimateScope(server: McpServer) {
  server.tool(
    'estimate_scope',
    'Estimate hours, cost, and timeline for a project based on requirements. Recommends services and provides low/mid/high estimates.',
    {
      requirements: z.string().describe('Project requirements — what needs to be built'),
      budget_max: z.number().optional().describe('Maximum budget in dollars'),
      timeline_max: z.number().optional().describe('Maximum timeline in weeks'),
    },
    async ({ requirements, budget_max, timeline_max }) => {
      const allServices = db.prepare('SELECT * FROM services').all() as any[];
      const reqLower = requirements.toLowerCase();

      // Score services by relevance
      const scored = allServices.map((svc) => {
        let score = 0;
        const keywords = [
          ...svc.name.toLowerCase().split(/\s+/),
          ...svc.category.toLowerCase().split(/\s+/),
          ...svc.description.toLowerCase().split(/\s+/).filter((w: string) => w.length > 4),
        ];

        for (const kw of keywords) {
          if (reqLower.includes(kw)) score++;
        }

        // Boost for common patterns
        if (/web|app|dashboard|portal|site/i.test(requirements) && svc.name.includes('Web Application')) score += 3;
        if (/mcp|claude|ai|automat/i.test(requirements) && /AI|MCP/.test(svc.category)) score += 3;
        if (/design|ui|ux|brand/i.test(requirements) && svc.category === 'Design') score += 3;
        if (/secur|auth|rls/i.test(requirements) && svc.category === 'Security') score += 2;
        if (/perfor|speed|lighthouse|core web/i.test(requirements) && svc.category === 'Performance') score += 2;
        if (/migrat|legacy|spreadsheet/i.test(requirements) && svc.name.includes('Migration')) score += 2;
        if (/strateg|consult|evaluat/i.test(requirements) && svc.category === 'Strategy') score += 2;

        return { ...svc, relevance_score: score };
      }).filter((s) => s.relevance_score > 0).sort((a, b) => b.relevance_score - a.relevance_score);

      // Take top matches (max 4 services)
      const recommended = scored.slice(0, 4);

      if (recommended.length === 0) {
        // Default to web dev
        const webDev = allServices.find((s) => s.name.includes('Web Application'));
        if (webDev) recommended.push({ ...webDev, relevance_score: 1 });
      }

      // Calculate estimates
      const estimates = {
        low: { hours: 0, cost: 0 },
        mid: { hours: 0, cost: 0 },
        high: { hours: 0, cost: 0 },
      };

      const breakdown = recommended.map((svc) => {
        const lowHours = svc.min_hours;
        const midHours = svc.typical_hours;
        const highHours = Math.ceil(svc.typical_hours * 1.5);

        estimates.low.hours += lowHours;
        estimates.low.cost += lowHours * svc.hourly_rate;
        estimates.mid.hours += midHours;
        estimates.mid.cost += midHours * svc.hourly_rate;
        estimates.high.hours += highHours;
        estimates.high.cost += highHours * svc.hourly_rate;

        return {
          service: svc.name,
          category: svc.category,
          rate: `$${svc.hourly_rate}/hr`,
          hours: { low: lowHours, typical: midHours, high: highHours },
          cost: {
            low: `$${(lowHours * svc.hourly_rate).toLocaleString()}`,
            typical: `$${(midHours * svc.hourly_rate).toLocaleString()}`,
            high: `$${(highHours * svc.hourly_rate).toLocaleString()}`,
          },
          deliverables: svc.deliverables,
        };
      });

      // Timeline estimates (assuming ~25 productive hours/week)
      const timelineWeeks = {
        low: Math.max(1, Math.ceil(estimates.low.hours / 30)),
        mid: Math.max(2, Math.ceil(estimates.mid.hours / 25)),
        high: Math.max(3, Math.ceil(estimates.high.hours / 20)),
      };

      // Budget feasibility
      let budgetNote = null;
      if (budget_max) {
        if (budget_max < estimates.low.cost) {
          budgetNote = `Budget of $${budget_max.toLocaleString()} is below our minimum estimate of $${estimates.low.cost.toLocaleString()}. Consider reducing scope or phasing the project.`;
        } else if (budget_max < estimates.mid.cost) {
          budgetNote = `Budget of $${budget_max.toLocaleString()} fits within the lean estimate. We can deliver core features but may need to cut nice-to-haves.`;
        } else {
          budgetNote = `Budget of $${budget_max.toLocaleString()} comfortably covers the recommended scope.`;
        }
      }

      let timelineNote = null;
      if (timeline_max) {
        if (timeline_max < timelineWeeks.low) {
          timelineNote = `${timeline_max}-week timeline is very aggressive. Consider a phased approach or increasing team size.`;
        } else if (timeline_max < timelineWeeks.mid) {
          timelineNote = `${timeline_max}-week timeline is tight but doable with focused scope.`;
        } else {
          timelineNote = `${timeline_max}-week timeline gives comfortable room for the recommended scope.`;
        }
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            estimates: {
              low: { hours: estimates.low.hours, cost: `$${estimates.low.cost.toLocaleString()}`, timeline: `${timelineWeeks.low} weeks` },
              recommended: { hours: estimates.mid.hours, cost: `$${estimates.mid.cost.toLocaleString()}`, timeline: `${timelineWeeks.mid} weeks` },
              comprehensive: { hours: estimates.high.hours, cost: `$${estimates.high.cost.toLocaleString()}`, timeline: `${timelineWeeks.high} weeks` },
            },
            services: breakdown,
            budget_assessment: budgetNote,
            timeline_assessment: timelineNote,
            next_step: 'Use generate_proposal with a client ID and brief to create a full proposal from this estimate.',
          }, null, 2),
        }],
      };
    }
  );
}
