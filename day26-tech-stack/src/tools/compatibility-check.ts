import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerCompatibilityCheck(server: McpServer) {
  server.tool(
    'check_compatibility',
    'Check how well two or more technologies work together — compatibility scores, integration notes, and potential friction points.',
    {
      technologies: z.array(z.string()).min(2).max(6).describe('Technology names to check compatibility between'),
    },
    async (params) => {
      const techs = params.technologies.map(name => {
        return db.prepare('SELECT * FROM technologies WHERE name LIKE ?').get(`%${name}%`) as {
          id: number; name: string; category: string;
        } | undefined;
      }).filter(Boolean) as Array<{ id: number; name: string; category: string }>;

      if (techs.length < 2) {
        return { content: [{ type: 'text' as const, text: `Could not find enough technologies. Found: ${techs.map(t => t.name).join(', ')}` }] };
      }

      const pairs: Array<{
        tech_a: string; tech_b: string; score: number | null; notes: string | null; status: string;
      }> = [];

      for (let i = 0; i < techs.length; i++) {
        for (let j = i + 1; j < techs.length; j++) {
          const compat = db.prepare(`
            SELECT c.score, c.notes
            FROM compatibility c
            WHERE (c.tech_a_id = ? AND c.tech_b_id = ?) OR (c.tech_a_id = ? AND c.tech_b_id = ?)
          `).get(techs[i].id, techs[j].id, techs[j].id, techs[i].id) as {
            score: number; notes: string | null;
          } | undefined;

          let status = 'unknown';
          if (compat) {
            if (compat.score >= 9) status = 'excellent';
            else if (compat.score >= 7.5) status = 'good';
            else if (compat.score >= 5) status = 'fair';
            else status = 'poor';
          } else if (techs[i].category === techs[j].category) {
            status = 'same-category';
          }

          pairs.push({
            tech_a: techs[i].name,
            tech_b: techs[j].name,
            score: compat?.score ?? null,
            notes: compat?.notes ?? (techs[i].category === techs[j].category
              ? `Both are ${techs[i].category} technologies — typically you choose one or the other, not both.`
              : 'No specific compatibility data available — these technologies can likely work together with standard integration patterns.'),
            status,
          });
        }
      }

      const knownScores = pairs.filter(p => p.score !== null);
      const avgScore = knownScores.length > 0
        ? Math.round((knownScores.reduce((sum, p) => sum + (p.score || 0), 0) / knownScores.length) * 10) / 10
        : null;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            technologies: techs.map(t => ({ name: t.name, category: t.category })),
            compatibility_pairs: pairs,
            overall_compatibility: avgScore,
            category_coverage: [...new Set(techs.map(t => t.category))],
            missing_categories: ['frontend', 'backend', 'database', 'hosting', 'auth', 'styling']
              .filter(cat => !techs.some(t => t.category === cat)),
          }, null, 2),
        }],
      };
    },
  );
}
