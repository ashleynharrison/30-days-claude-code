import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerSiteOverview } from './tools/site-overview.js';
import { registerAuditResults } from './tools/audit-results.js';
import { registerFindingsReport } from './tools/findings-report.js';
import { registerBudgetTracker } from './tools/budget-tracker.js';
import { registerTrendAnalysis } from './tools/trend-analysis.js';
import { registerTaskManager } from './tools/task-manager.js';

const server = new McpServer({
  name: 'Lighthouse Audit Dashboard',
  version: '1.0.0',
});

registerSiteOverview(server);
registerAuditResults(server);
registerFindingsReport(server);
registerBudgetTracker(server);
registerTrendAnalysis(server);
registerTaskManager(server);

const transport = new StdioServerTransport();
await server.connect(transport);
