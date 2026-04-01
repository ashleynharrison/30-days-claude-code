import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerCompareTech(server: McpServer) {
  server.tool(
    'compare_technologies',
    'Compare two or more technologies head-to-head across all evaluation criteria — scores, tradeoffs, and which wins in each category.',
    {
      names: z.array(z.string()).min(2).max(5).describe('Technology names to compare (e.g., ["Next.js", "Remix", "SvelteKit"])'),
      priority: z.string().optional().describe('Priority to weight higher: "performance", "scalability", "time_to_market", "developer_experience", or "balanced"'),
    },
    async (params) => {
      const techs = params.names.map(name => {
        return db.prepare('SELECT * FROM technologies WHERE name LIKE ?').get(`%${name}%`) as {
          id: number; name: string; category: string; description: string;
        } | undefined;
      }).filter(Boolean) as Array<{ id: number; name: string; category: string; description: string }>;

      if (techs.length < 2) {
        return { content: [{ type: 'text' as const, text: `Could not find enough technologies. Found: ${techs.map(t => t.name).join(', ')}` }] };
      }

      const criteria = db.prepare('SELECT * FROM criteria ORDER BY id').all() as Array<{
        id: number; name: string; category: string; default_weight: number;
      }>;

      // Adjust weights based on priority
      const weights = new Map(criteria.map(c => [c.id, c.default_weight]));
      if (params.priority && params.priority !== 'balanced') {
        const boostMap: Record<string, string[]> = {
          performance: ['performance', 'hosting_cost'],
          scalability: ['scalability', 'maintenance_cost'],
          time_to_market: ['time_to_market', 'learning_curve', 'developer_experience'],
          developer_experience: ['developer_experience', 'type_safety', 'learning_curve'],
        };
        const boostCriteria = boostMap[params.priority] || [];
        for (const c of criteria) {
          if (boostCriteria.includes(c.name)) {
            weights.set(c.id, c.default_weight * 1.5);
          }
        }
      }

      const comparison = techs.map(tech => {
        const scores = db.prepare(`
          SELECT s.score, s.notes, c.name as criteria, c.id as criteria_id
          FROM scores s JOIN criteria c ON s.criteria_id = c.id
          WHERE s.technology_id = ?
          ORDER BY c.id
        `).all(tech.id) as Array<{ score: number; notes: string | null; criteria: string; criteria_id: number }>;

        const weightedTotal = scores.reduce((sum, s) => sum + s.score * (weights.get(s.criteria_id) || 1), 0);
        const totalWeight = scores.reduce((sum, s) => sum + (weights.get(s.criteria_id) || 1), 0);

        return {
          name: tech.name,
          category: tech.category,
          weighted_score: Math.round((weightedTotal / totalWeight) * 10) / 10,
          scores: Object.fromEntries(scores.map(s => [s.criteria, { score: s.score, notes: s.notes }])),
        };
      });

      comparison.sort((a, b) => b.weighted_score - a.weighted_score);

      // Determine winner per criteria
      const criteriaWinners = criteria.map(c => {
        const scored = comparison.map(t => ({ name: t.name, score: t.scores[c.name]?.score || 0 }));
        scored.sort((a, b) => b.score - a.score);
        return { criteria: c.name, winner: scored[0].name, scores: scored };
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            priority: params.priority || 'balanced',
            overall_ranking: comparison.map((t, i) => ({
              rank: i + 1,
              name: t.name,
              weighted_score: t.weighted_score,
            })),
            detailed_comparison: comparison,
            criteria_winners: criteriaWinners,
            recommendation: `${comparison[0].name} wins overall with a weighted score of ${comparison[0].weighted_score}${params.priority ? ` (optimized for ${params.priority})` : ''}.`,
          }, null, 2),
        }],
      };
    },
  );
}
