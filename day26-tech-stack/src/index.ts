import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerEvaluateTech } from './tools/evaluate-tech.js';
import { registerCompareTech } from './tools/compare-tech.js';
import { registerStackRecommendation } from './tools/stack-recommendation.js';
import { registerCompatibilityCheck } from './tools/compatibility-check.js';
import { registerProjectAnalysis } from './tools/project-analysis.js';
import { registerTechSearch } from './tools/tech-search.js';

const server = new McpServer({
  name: 'Tech Stack Decision Engine',
  version: '1.0.0',
});

registerEvaluateTech(server);
registerCompareTech(server);
registerStackRecommendation(server);
registerCompatibilityCheck(server);
registerProjectAnalysis(server);
registerTechSearch(server);

const transport = new StdioServerTransport();
await server.connect(transport);
