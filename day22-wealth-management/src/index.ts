import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerListClients } from './tools/list-clients.js';
import { registerGetPortfolio } from './tools/get-portfolio.js';
import { registerGetAccount } from './tools/get-account.js';
import { registerListTransactions } from './tools/list-transactions.js';
import { registerPortfolioAnalysis } from './tools/portfolio-analysis.js';
import { registerGetAlerts } from './tools/get-alerts.js';

const server = new McpServer({
  name: 'Wealth Management Portfolio Tracker',
  version: '1.0.0',
});

registerListClients(server);
registerGetPortfolio(server);
registerGetAccount(server);
registerListTransactions(server);
registerPortfolioAnalysis(server);
registerGetAlerts(server);

const transport = new StdioServerTransport();
await server.connect(transport);
