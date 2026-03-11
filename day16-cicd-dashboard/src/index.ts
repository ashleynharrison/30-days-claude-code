import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerBuildStatus } from './tools/build-status.js';
import { registerDeployHistory } from './tools/deploy-history.js';
import { registerPipelineHealth } from './tools/pipeline-health.js';
import { registerBuildDetails } from './tools/build-details.js';
import { registerUptimeReport } from './tools/uptime-report.js';
import { registerDashboardSummary } from './tools/dashboard-summary.js';

const server = new McpServer({
  name: 'CI/CD Status Dashboard',
  version: '1.0.0',
});

registerBuildStatus(server);
registerDeployHistory(server);
registerPipelineHealth(server);
registerBuildDetails(server);
registerUptimeReport(server);
registerDashboardSummary(server);

const transport = new StdioServerTransport();
await server.connect(transport);
