import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerTechSearch(server: McpServer) {
  server.tool(
    'tech_search',
    'Search and filter technologies by category, maturity, learning curve, license, or community size. Get a quick overview of available options.',
    {
      category: z.string().optional().describe('Filter by category: frontend, backend, database, hosting, auth, styling'),
      maturity: z.string().optional().describe('Filter by maturity: mature, stable, emerging'),
      learning_curve: z.string().optional().describe('Filter by learning curve: low, medium, high'),
      license: z.string().optional().describe('Filter by license type: open-source, MIT, proprietary, etc.'),
      min_stars: z.number().optional().describe('Minimum GitHub stars'),
    },
    async (params) => {
      let sql = 'SELECT * FROM technologies WHERE 1=1';
      const args: unknown[] = [];

      if (params.category) {
        sql += ' AND category = ?';
        args.push(params.category);
      }
      if (params.maturity) {
        sql += ' AND maturity = ?';
        args.push(params.maturity);
      }
      if (params.learning_curve) {
        sql += ' AND learning_curve = ?';
        args.push(params.learning_curve);
      }
      if (params.license) {
        sql += ' AND license LIKE ?';
        args.push(`%${params.license}%`);
      }
      if (params.min_stars) {
        sql += ' AND github_stars >= ?';
        args.push(params.min_stars);
      }

      sql += ' ORDER BY category, github_stars DESC';

      const techs = db.prepare(sql).all(...args) as Array<{
        id: number; name: string; category: string; subcategory: string;
        license: string; maturity: string; learning_curve: string;
        community_size: string; github_stars: number; weekly_npm_downloads: number;
        description: string;
      }>;

      // Get average score for each tech
      const results = techs.map(tech => {
        const avgScore = db.prepare(`
          SELECT AVG(s.score * c.default_weight) / AVG(c.default_weight) as weighted_avg
          FROM scores s JOIN criteria c ON s.criteria_id = c.id
          WHERE s.technology_id = ?
        `).get(tech.id) as { weighted_avg: number };

        return {
          name: tech.name,
          category: tech.category,
          subcategory: tech.subcategory,
          license: tech.license,
          maturity: tech.maturity,
          learning_curve: tech.learning_curve,
          community_size: tech.community_size,
          github_stars: tech.github_stars || undefined,
          weekly_npm_downloads: tech.weekly_npm_downloads || undefined,
          overall_score: Math.round(avgScore.weighted_avg * 10) / 10,
          description: tech.description,
        };
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            count: results.length,
            filters: { category: params.category, maturity: params.maturity, learning_curve: params.learning_curve, license: params.license, min_stars: params.min_stars },
            technologies: results,
          }, null, 2),
        }],
      };
    },
  );
}
