import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerCompetitorLookup } from './tools/competitor-lookup.js';
import { registerPricingComparison } from './tools/pricing-comparison.js';
import { registerFeatureMatrix } from './tools/feature-matrix.js';
import { registerMarketMoves } from './tools/market-moves.js';
import { registerPositioningAnalysis } from './tools/positioning-analysis.js';
import { registerWinLossTracker } from './tools/win-loss-tracker.js';

const server = new McpServer({
  name: 'Competitive Analysis Dashboard',
  version: '1.0.0',
});

registerCompetitorLookup(server);
registerPricingComparison(server);
registerFeatureMatrix(server);
registerMarketMoves(server);
registerPositioningAnalysis(server);
registerWinLossTracker(server);

const transport = new StdioServerTransport();
await server.connect(transport);
