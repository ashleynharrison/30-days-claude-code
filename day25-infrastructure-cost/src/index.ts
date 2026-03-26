import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerCostBreakdown } from './tools/cost-breakdown.js';
import { registerServiceCosts } from './tools/service-costs.js';
import { registerBudgetStatus } from './tools/budget-status.js';
import { registerAnomalyDetection } from './tools/anomaly-detection.js';
import { registerCostForecast } from './tools/cost-forecast.js';
import { registerProviderComparison } from './tools/provider-comparison.js';

const server = new McpServer({
  name: 'Infrastructure Cost Tracker',
  version: '1.0.0',
});

registerCostBreakdown(server);
registerServiceCosts(server);
registerBudgetStatus(server);
registerAnomalyDetection(server);
registerCostForecast(server);
registerProviderComparison(server);

const transport = new StdioServerTransport();
await server.connect(transport);
