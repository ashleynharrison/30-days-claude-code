import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerEvaluateTech(server: McpServer) {
  server.tool(
    'evaluate_technology',
    'Get a detailed evaluation of a specific technology — scores across all criteria, strengths, weaknesses, and best-fit scenarios.',
    {
      name: z.string().describe('Technology name (e.g., "Next.js", "PostgreSQL", "Vercel")'),
    },
    async (params) => {
      const tech = db.prepare(`
        SELECT * FROM technologies WHERE name LIKE ?
      `).get(`%${params.name}%`) as {
        id: number; name: string; category: string; subcategory: string;
        license: string; maturity: string; learning_curve: string;
        community_size: string; github_stars: number; weekly_npm_downloads: number;
        description: string;
      } | undefined;

      if (!tech) {
        return { content: [{ type: 'text' as const, text: `Technology "${params.name}" not found. Try searching with tech_search.` }] };
      }

      const scores = db.prepare(`
        SELECT c.name as criteria, c.category, s.score, s.notes, c.default_weight
        FROM scores s
        JOIN criteria c ON s.criteria_id = c.id
        WHERE s.technology_id = ?
        ORDER BY s.score DESC
      `).all(tech.id) as Array<{
        criteria: string; category: string; score: number; notes: string | null; default_weight: number;
      }>;

      const weightedAvg = scores.reduce((sum, s) => sum + s.score * s.default_weight, 0) /
        scores.reduce((sum, s) => sum + s.default_weight, 0);

      const strengths = scores.filter(s => s.score >= 8.5).map(s => ({ criteria: s.criteria, score: s.score, notes: s.notes }));
      const weaknesses = scores.filter(s => s.score < 7.0).map(s => ({ criteria: s.criteria, score: s.score, notes: s.notes }));

      const compatibilities = db.prepare(`
        SELECT t.name, c.score, c.notes
        FROM compatibility c
        JOIN technologies t ON (c.tech_b_id = t.id OR c.tech_a_id = t.id)
        WHERE (c.tech_a_id = ? OR c.tech_b_id = ?) AND t.id != ?
        ORDER BY c.score DESC
      `).all(tech.id, tech.id, tech.id) as Array<{ name: string; score: number; notes: string | null }>;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            technology: {
              name: tech.name,
              category: tech.category,
              subcategory: tech.subcategory,
              license: tech.license,
              maturity: tech.maturity,
              learning_curve: tech.learning_curve,
              community_size: tech.community_size,
              github_stars: tech.github_stars || undefined,
              weekly_npm_downloads: tech.weekly_npm_downloads || undefined,
              description: tech.description,
            },
            overall_score: Math.round(weightedAvg * 10) / 10,
            scores: scores.map(s => ({
              criteria: s.criteria,
              category: s.category,
              score: s.score,
              notes: s.notes,
            })),
            strengths,
            weaknesses,
            best_pairs: compatibilities,
          }, null, 2),
        }],
      };
    },
  );
}
