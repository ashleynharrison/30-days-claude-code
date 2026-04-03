import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerSearchMeetings } from './tools/search-meetings.js';
import { registerMeetingSummary } from './tools/meeting-summary.js';
import { registerActionItems } from './tools/action-items.js';
import { registerDecisionLog } from './tools/decision-log.js';
import { registerOwnerWorkload } from './tools/owner-workload.js';
import { registerFollowUps } from './tools/follow-ups.js';

const server = new McpServer({
  name: 'Day 27 — AI Meeting Notes & Action Items',
  version: '1.0.0',
});

registerSearchMeetings(server);
registerMeetingSummary(server);
registerActionItems(server);
registerDecisionLog(server);
registerOwnerWorkload(server);
registerFollowUps(server);

const transport = new StdioServerTransport();
await server.connect(transport);
