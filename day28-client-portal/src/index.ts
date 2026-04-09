import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerClientOverview } from './tools/client-overview.js';
import { registerProjectStatus } from './tools/project-status.js';
import { registerInvoiceTracker } from './tools/invoice-tracker.js';
import { registerDeliverableApprovals } from './tools/deliverable-approvals.js';
import { registerMessageInbox } from './tools/message-inbox.js';
import { registerPipelineSummary } from './tools/pipeline-summary.js';

const server = new McpServer({
  name: 'Day 28 — Interactive Client Portal',
  version: '1.0.0',
});

registerClientOverview(server);
registerProjectStatus(server);
registerInvoiceTracker(server);
registerDeliverableApprovals(server);
registerMessageInbox(server);
registerPipelineSummary(server);

const transport = new StdioServerTransport();
await server.connect(transport);
