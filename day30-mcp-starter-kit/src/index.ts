// ---------------------------------------------------------------------------
// Day 30 — The MCP Starter Kit
// ---------------------------------------------------------------------------
// Wire up your tools here. That's it. Add more by:
//   1. Dropping a new file in src/tools/
//   2. Exporting a register*() function that calls server.tool(...)
//   3. Importing and registering it below
// ---------------------------------------------------------------------------

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerContactLookup } from './tools/contact-lookup.js';
import { registerContactUpsert } from './tools/contact-upsert.js';
import { registerItemsList } from './tools/items-list.js';
import { registerItemCreate } from './tools/item-create.js';
import { registerAnalyticsSummary } from './tools/analytics-summary.js';
import { registerActivityLog } from './tools/activity-log.js';

const server = new McpServer({
  name: 'Day 30 — MCP Starter Kit',
  version: '1.0.0',
});

registerContactLookup(server);
registerContactUpsert(server);
registerItemsList(server);
registerItemCreate(server);
registerAnalyticsSummary(server);
registerActivityLog(server);

const transport = new StdioServerTransport();
await server.connect(transport);
