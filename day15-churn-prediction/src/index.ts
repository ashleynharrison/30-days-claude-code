import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerCustomerOverview } from './tools/customer-overview.js';
import { registerChurnRiskScore } from './tools/churn-risk-score.js';
import { registerAtRiskCohort } from './tools/at-risk-cohort.js';
import { registerUsageTrends } from './tools/usage-trends.js';
import { registerInterventionRecommendations } from './tools/intervention-recommendations.js';
import { registerPipelineSummary } from './tools/pipeline-summary.js';

const server = new McpServer({
  name: 'Churn Prediction Pipeline',
  version: '1.0.0',
});

registerCustomerOverview(server);
registerChurnRiskScore(server);
registerAtRiskCohort(server);
registerUsageTrends(server);
registerInterventionRecommendations(server);
registerPipelineSummary(server);

const transport = new StdioServerTransport();
await server.connect(transport);
