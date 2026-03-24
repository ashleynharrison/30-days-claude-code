import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerListTokens } from './tools/list-tokens.js';
import { registerListComponents } from './tools/list-components.js';
import { registerGetComponent } from './tools/get-component.js';
import { registerA11yAudit } from './tools/a11y-audit.js';
import { registerGetChangelog } from './tools/get-changelog.js';
import { registerSystemOverview } from './tools/system-overview.js';

const server = new McpServer({
  name: 'Design System Component Library',
  version: '1.0.0',
});

registerListTokens(server);
registerListComponents(server);
registerGetComponent(server);
registerA11yAudit(server);
registerGetChangelog(server);
registerSystemOverview(server);

const transport = new StdioServerTransport();
await server.connect(transport);
