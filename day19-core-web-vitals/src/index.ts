import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerSiteLookup } from './tools/site-lookup.js';
import { registerVitalsSnapshot } from './tools/vitals-snapshot.js';
import { registerTrendAnalysis } from './tools/trend-analysis.js';
import { registerBudgetCheck } from './tools/budget-check.js';
import { registerOptimizationHitlist } from './tools/optimization-hitlist.js';
import { registerResourceAudit } from './tools/resource-audit.js';

const server = new McpServer({
  name: 'Core Web Vitals Monitor',
  version: '1.0.0',
});

registerSiteLookup(server);
registerVitalsSnapshot(server);
registerTrendAnalysis(server);
registerBudgetCheck(server);
registerOptimizationHitlist(server);
registerResourceAudit(server);

const transport = new StdioServerTransport();
await server.connect(transport);
