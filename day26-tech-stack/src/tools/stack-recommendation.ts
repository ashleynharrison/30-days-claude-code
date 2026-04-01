import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerStackRecommendation(server: McpServer) {
  server.tool(
    'recommend_stack',
    'Get a full-stack recommendation based on project requirements — team size, budget, timeline, and priority. Returns recommended technologies for each layer with rationale.',
    {
      team_size: z.number().optional().describe('Number of developers (default: 5)'),
      budget: z.enum(['low', 'medium', 'high']).optional().describe('Budget level'),
      timeline: z.enum(['short', 'medium', 'long']).optional().describe('Timeline: short (< 3 months), medium (3-9 months), long (> 9 months)'),
      priority: z.enum(['time_to_market', 'scalability', 'performance', 'developer_experience', 'balanced']).optional().describe('Primary priority for the stack'),
      industry: z.string().optional().describe('Industry or domain (e.g., "FinTech", "Healthcare", "E-Commerce")'),
    },
    async (params) => {
      const teamSize = params.team_size ?? 5;
      const budget = params.budget ?? 'medium';
      const timeline = params.timeline ?? 'medium';
      const priority = params.priority ?? 'balanced';

      const criteria = db.prepare('SELECT * FROM criteria ORDER BY id').all() as Array<{
        id: number; name: string; default_weight: number;
      }>;

      // Adjust weights based on constraints
      const weights = new Map(criteria.map(c => [c.id, c.default_weight]));

      // Timeline adjustments
      if (timeline === 'short') {
        for (const c of criteria) {
          if (c.name === 'time_to_market') weights.set(c.id, 2.0);
          if (c.name === 'learning_curve') weights.set(c.id, 1.5);
        }
      }

      // Budget adjustments
      if (budget === 'low') {
        for (const c of criteria) {
          if (c.name === 'hosting_cost') weights.set(c.id, 1.5);
          if (c.name === 'vendor_lock_in') weights.set(c.id, 1.0);
        }
      }

      // Team size adjustments
      if (teamSize <= 3) {
        for (const c of criteria) {
          if (c.name === 'developer_experience') weights.set(c.id, 1.5);
          if (c.name === 'learning_curve') weights.set(c.id, 1.3);
        }
      } else if (teamSize >= 10) {
        for (const c of criteria) {
          if (c.name === 'scalability') weights.set(c.id, 1.5);
          if (c.name === 'type_safety') weights.set(c.id, 1.3);
          if (c.name === 'hiring_pool') weights.set(c.id, 1.3);
        }
      }

      // Priority boost
      const priorityMap: Record<string, string[]> = {
        time_to_market: ['time_to_market', 'learning_curve', 'developer_experience'],
        scalability: ['scalability', 'maintenance_cost', 'type_safety'],
        performance: ['performance', 'hosting_cost'],
        developer_experience: ['developer_experience', 'type_safety', 'learning_curve'],
      };
      if (priority !== 'balanced' && priorityMap[priority]) {
        for (const c of criteria) {
          if (priorityMap[priority].includes(c.name)) {
            weights.set(c.id, (weights.get(c.id) || 1) * 1.5);
          }
        }
      }

      const categories = ['frontend', 'backend', 'database', 'hosting', 'auth', 'styling'];
      const recommendations: Record<string, Array<{ name: string; score: number; description: string }>> = {};

      for (const category of categories) {
        const techs = db.prepare('SELECT * FROM technologies WHERE category = ?').all(category) as Array<{
          id: number; name: string; description: string;
        }>;

        const scored = techs.map(tech => {
          const scores = db.prepare(`
            SELECT s.score, c.id as criteria_id
            FROM scores s JOIN criteria c ON s.criteria_id = c.id
            WHERE s.technology_id = ?
          `).all(tech.id) as Array<{ score: number; criteria_id: number }>;

          const weightedTotal = scores.reduce((sum, s) => sum + s.score * (weights.get(s.criteria_id) || 1), 0);
          const totalWeight = scores.reduce((sum, s) => sum + (weights.get(s.criteria_id) || 1), 0);

          return {
            name: tech.name,
            score: Math.round((weightedTotal / totalWeight) * 10) / 10,
            description: tech.description,
          };
        });

        scored.sort((a, b) => b.score - a.score);
        recommendations[category] = scored.slice(0, 3);
      }

      // Check compatibility of top picks
      const topPicks = Object.values(recommendations).map(r => r[0]?.name).filter(Boolean);
      const topPickIds = topPicks.map(name =>
        (db.prepare('SELECT id FROM technologies WHERE name = ?').get(name) as { id: number })?.id
      ).filter(Boolean);

      const compatPairs: Array<{ tech_a: string; tech_b: string; score: number; notes: string | null }> = [];
      for (let i = 0; i < topPickIds.length; i++) {
        for (let j = i + 1; j < topPickIds.length; j++) {
          const compat = db.prepare(`
            SELECT c.score, c.notes, t1.name as tech_a, t2.name as tech_b
            FROM compatibility c
            JOIN technologies t1 ON c.tech_a_id = t1.id
            JOIN technologies t2 ON c.tech_b_id = t2.id
            WHERE (c.tech_a_id = ? AND c.tech_b_id = ?) OR (c.tech_a_id = ? AND c.tech_b_id = ?)
          `).get(topPickIds[i], topPickIds[j], topPickIds[j], topPickIds[i]) as {
            score: number; notes: string | null; tech_a: string; tech_b: string;
          } | undefined;

          if (compat) {
            compatPairs.push(compat);
          }
        }
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            constraints: { team_size: teamSize, budget, timeline, priority, industry: params.industry },
            recommended_stack: Object.fromEntries(
              Object.entries(recommendations).map(([cat, techs]) => [
                cat,
                { recommended: techs[0], alternatives: techs.slice(1) },
              ])
            ),
            compatibility_notes: compatPairs,
            summary: `Recommended stack for a ${teamSize}-person team with ${budget} budget on a ${timeline} timeline, optimized for ${priority}.`,
          }, null, 2),
        }],
      };
    },
  );
}
