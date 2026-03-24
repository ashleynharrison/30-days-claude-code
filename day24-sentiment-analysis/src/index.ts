import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerReviewSearch } from './tools/review-search.js';
import { registerSentimentOverview } from './tools/sentiment-overview.js';
import { registerThemeAnalysis } from './tools/theme-analysis.js';
import { registerTrendTracker } from './tools/trend-tracker.js';
import { registerCompetitiveSentiment } from './tools/competitive-sentiment.js';
import { registerActionItems } from './tools/action-items.js';

const server = new McpServer({
  name: 'Sentiment Analysis Pipeline',
  version: '1.0.0',
});

registerReviewSearch(server);
registerSentimentOverview(server);
registerThemeAnalysis(server);
registerTrendTracker(server);
registerCompetitiveSentiment(server);
registerActionItems(server);

const transport = new StdioServerTransport();
await server.connect(transport);
