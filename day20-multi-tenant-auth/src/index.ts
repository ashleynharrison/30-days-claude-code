import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerOrgLookup } from './tools/org-lookup.js';
import { registerUserPermissions } from './tools/user-permissions.js';
import { registerInviteStatus } from './tools/invite-status.js';
import { registerRoleHierarchy } from './tools/role-hierarchy.js';
import { registerAuditLog } from './tools/audit-log.js';
import { registerTenantHealth } from './tools/tenant-health.js';

const server = new McpServer({
  name: 'Multi-Tenant Auth System',
  version: '1.0.0',
});

registerOrgLookup(server);
registerUserPermissions(server);
registerInviteStatus(server);
registerRoleHierarchy(server);
registerAuditLog(server);
registerTenantHealth(server);

const transport = new StdioServerTransport();
await server.connect(transport);
