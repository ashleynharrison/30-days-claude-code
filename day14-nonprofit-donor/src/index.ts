import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerDonorLookup } from './tools/donor-lookup.js';
import { registerDonationHistory } from './tools/donation-history.js';
import { registerCampaignDashboard } from './tools/campaign-dashboard.js';
import { registerGrantTracker } from './tools/grant-tracker.js';
import { registerRetentionReport } from './tools/retention-report.js';
import { registerEngagementLog } from './tools/engagement-log.js';

const server = new McpServer({
  name: 'Nonprofit Donor & Grant Tracker',
  version: '1.0.0',
});

registerDonorLookup(server);
registerDonationHistory(server);
registerCampaignDashboard(server);
registerGrantTracker(server);
registerRetentionReport(server);
registerEngagementLog(server);

const transport = new StdioServerTransport();
await server.connect(transport);
