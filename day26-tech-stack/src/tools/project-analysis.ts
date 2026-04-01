import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerProjectAnalysis(server: McpServer) {
  server.tool(
    'analyze_project',
    'Analyze a sample project and its recommended tech stack — see the rationale, tradeoffs, and alternative stacks for real-world scenarios.',
    {
      project: z.string().optional().describe('Project name to analyze (e.g., "FinTrack", "HealthBridge"). Leave empty to list all projects.'),
    },
    async (params) => {
      if (!params.project) {
        const projects = db.prepare('SELECT * FROM projects ORDER BY id').all() as Array<{
          id: number; name: string; team_size: number; budget: string;
          timeline: string; priority: string; industry: string; description: string;
        }>;

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              projects: projects.map(p => ({
                name: p.name,
                team_size: p.team_size,
                budget: p.budget,
                timeline: p.timeline,
                priority: p.priority,
                industry: p.industry,
                description: p.description,
              })),
            }, null, 2),
          }],
        };
      }

      const project = db.prepare('SELECT * FROM projects WHERE name LIKE ?').get(`%${params.project}%`) as {
        id: number; name: string; team_size: number; budget: string;
        timeline: string; priority: string; industry: string; description: string;
      } | undefined;

      if (!project) {
        return { content: [{ type: 'text' as const, text: `Project "${params.project}" not found. Use analyze_project without a name to list all projects.` }] };
      }

      const recs = db.prepare(`
        SELECT r.*, t.name as tech_name, t.category as tech_category, t.description as tech_description
        FROM recommendations r
        JOIN technologies t ON r.technology_id = t.id
        WHERE r.project_id = ?
        ORDER BY r.category, r.rank
      `).all(project.id) as Array<{
        category: string; rank: number; weighted_score: number; rationale: string;
        tradeoffs: string | null; tech_name: string; tech_category: string; tech_description: string;
      }>;

      const byCategory: Record<string, typeof recs> = {};
      for (const rec of recs) {
        if (!byCategory[rec.category]) byCategory[rec.category] = [];
        byCategory[rec.category].push(rec);
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            project: {
              name: project.name,
              team_size: project.team_size,
              budget: project.budget,
              timeline: project.timeline,
              priority: project.priority,
              industry: project.industry,
              description: project.description,
            },
            recommended_stack: Object.fromEntries(
              Object.entries(byCategory).map(([cat, recs]) => [
                cat,
                recs.map(r => ({
                  rank: r.rank,
                  technology: r.tech_name,
                  score: r.weighted_score,
                  rationale: r.rationale,
                  tradeoffs: r.tradeoffs,
                })),
              ])
            ),
          }, null, 2),
        }],
      };
    },
  );
}
