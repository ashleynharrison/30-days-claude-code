import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerGenerateProposal } from './tools/generate-proposal.js';
import { registerListProposals } from './tools/list-proposals.js';
import { registerGetProposal } from './tools/get-proposal.js';
import { registerListServices } from './tools/list-services.js';
import { registerListTemplates } from './tools/list-templates.js';
import { registerEstimateScope } from './tools/estimate-scope.js';

const server = new McpServer({
  name: 'AI Proposal Writer',
  version: '1.0.0',
});

registerGenerateProposal(server);
registerListProposals(server);
registerGetProposal(server);
registerListServices(server);
registerListTemplates(server);
registerEstimateScope(server);

const transport = new StdioServerTransport();
await server.connect(transport);
