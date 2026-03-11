import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerBuildDetails(server: McpServer) {
  server.tool(
    'build_details',
    'Detailed breakdown of a specific build — all stages with durations, statuses, and error logs. Use build ID from build_status.',
    {
      build_id: z.number().describe('The build ID to inspect'),
    },
    async (params) => {
      const build = db.prepare(`
        SELECT b.*, p.name as project_name, pl.name as pipeline_name
        FROM builds b
        JOIN projects p ON b.project_id = p.id
        JOIN pipelines pl ON b.pipeline_id = pl.id
        WHERE b.id = ?
      `).get(params.build_id);

      if (!build) {
        return {
          content: [{ type: 'text' as const, text: `Build #${params.build_id} not found.` }],
        };
      }

      const stages = db.prepare(`
        SELECT * FROM build_stages WHERE build_id = ? ORDER BY id ASC
      `).all(params.build_id);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ build, stages }, null, 2),
        }],
      };
    },
  );
}
