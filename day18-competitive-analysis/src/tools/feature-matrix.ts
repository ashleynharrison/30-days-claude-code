import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerFeatureMatrix(server: McpServer) {
  server.tool(
    'feature_matrix',
    'Compare features across competitors. Shows which features each competitor supports, maturity levels, and gaps. Filter by category or specific feature.',
    {
      category: z.string().optional().describe('Filter by feature category (e.g. CI/CD, Security, AI Features, Analytics, Collaboration)'),
      feature: z.string().optional().describe('Search for a specific feature by name (partial match)'),
      competitor: z.string().optional().describe('Filter to show features for a specific competitor'),
    },
    async ({ category, feature, competitor }) => {
      let query = `
        SELECT f.*, c.name as competitor_name
        FROM features f
        JOIN competitors c ON f.competitor_id = c.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (category) {
        query += ` AND f.feature_category LIKE ?`;
        params.push(`%${category}%`);
      }
      if (feature) {
        query += ` AND f.feature_name LIKE ?`;
        params.push(`%${feature}%`);
      }
      if (competitor) {
        query += ` AND c.name LIKE ?`;
        params.push(`%${competitor}%`);
      }

      query += ` ORDER BY f.feature_category, f.feature_name, c.name`;

      const features = db.prepare(query).all(...params) as any[];

      if (features.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No features found matching your criteria.' }] };
      }

      // Build comparison matrix
      const matrix: Record<string, Record<string, { supported: boolean; maturity: string | null }>> = {};
      const categories: Record<string, string[]> = {};

      for (const f of features) {
        const key = `${f.feature_category}: ${f.feature_name}`;
        if (!matrix[key]) matrix[key] = {};
        matrix[key][f.competitor_name] = {
          supported: f.supported === 1,
          maturity: f.maturity,
        };
        if (!categories[f.feature_category]) categories[f.feature_category] = [];
        if (!categories[f.feature_category].includes(f.feature_name)) {
          categories[f.feature_category].push(f.feature_name);
        }
      }

      // Summary stats
      const competitors = [...new Set(features.map((f: any) => f.competitor_name))];
      const summary = competitors.map((name) => {
        const compFeatures = features.filter((f: any) => f.competitor_name === name);
        const supported = compFeatures.filter((f: any) => f.supported === 1).length;
        return {
          competitor: name,
          features_supported: supported,
          features_total: compFeatures.length,
          coverage: `${Math.round((supported / compFeatures.length) * 100)}%`,
        };
      });

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ matrix, categories, coverage_summary: summary }, null, 2) }],
      };
    }
  );
}
