import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerProjectConfig } from './tools/project-config.js';
import { registerRolePermissions } from './tools/role-permissions.js';
import { registerRLSInspector } from './tools/rls-inspector.js';
import { registerUserAccess } from './tools/user-access.js';
import { registerSecurityAudit } from './tools/security-audit.js';
import { registerAuthEvents } from './tools/auth-events.js';

const server = new McpServer({
  name: 'Auth & RLS Starter Kit',
  version: '1.0.0',
});

registerProjectConfig(server);
registerRolePermissions(server);
registerRLSInspector(server);
registerUserAccess(server);
registerSecurityAudit(server);
registerAuthEvents(server);

const transport = new StdioServerTransport();
await server.connect(transport);
