import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { initializeDb } from './database.js';
import { handleSearchListings } from './tools/search-listings.js';
import { handleGetListingDetails } from './tools/get-listing-details.js';
import { handleClientMatch } from './tools/client-match.js';
import { handleShowingSchedule } from './tools/showing-schedule.js';
import { handlePipelineSummary } from './tools/pipeline-summary.js';
import { handleStaleListings } from './tools/stale-listings.js';

const server = new McpServer({
  name: 'day04-real-estate',
  version: '1.0.0',
});

// ── Tool definitions ──

server.tool(
  'search_listings',
  'Search listings by price, beds, baths, neighborhood, status, property type, or features',
  {
    query: z.string().optional().describe('Free text search — address, neighborhood, MLS number, or description'),
    min_price: z.number().optional().describe('Minimum listing price'),
    max_price: z.number().optional().describe('Maximum listing price'),
    bedrooms: z.number().optional().describe('Minimum number of bedrooms'),
    bathrooms: z.number().optional().describe('Minimum number of bathrooms'),
    status: z.enum(['Active', 'Pending', 'Sold', 'Expired', 'Withdrawn']).optional().describe('Listing status filter'),
    neighborhood: z.string().optional().describe('Neighborhood name (e.g., Silver Lake, Mar Vista)'),
    property_type: z.enum(['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land']).optional().describe('Property type filter'),
    features: z.string().optional().describe('Feature keyword (e.g., pool, ADU, garage)'),
  },
  async (args) => ({ content: [{ type: 'text', text: handleSearchListings(args) }] })
);

server.tool(
  'get_listing_details',
  'Full listing details including showings, offers, and open tasks',
  {
    listing_id: z.number().optional().describe('Listing ID'),
    mls_number: z.string().optional().describe('MLS number (e.g., MLS-26-00142)'),
    address: z.string().optional().describe('Street address (partial match)'),
  },
  async (args) => ({ content: [{ type: 'text', text: handleGetListingDetails(args) }] })
);

server.tool(
  'client_match',
  'Find active listings matching a buyer\'s budget, bedroom needs, property type preferences, and preferred neighborhoods',
  {
    client_id: z.number().optional().describe('Client ID'),
    client_name: z.string().optional().describe('Client name (partial match)'),
  },
  async (args) => ({ content: [{ type: 'text', text: handleClientMatch(args) }] })
);

server.tool(
  'showing_schedule',
  'View upcoming and recent showings with client and listing context',
  {
    date_range_days: z.number().optional().describe('Number of days to look back and forward (default: 7)'),
    agent: z.string().optional().describe('Filter by agent name'),
    listing_id: z.number().optional().describe('Filter by listing ID'),
  },
  async (args) => ({ content: [{ type: 'text', text: handleShowingSchedule(args) }] })
);

server.tool(
  'pipeline_summary',
  'Deal pipeline overview — active listings, pending deals, offers, sold volume, upcoming closings, and overdue tasks',
  {
    agent: z.string().optional().describe('Filter by agent name (optional — shows all agents if omitted)'),
  },
  async (args) => ({ content: [{ type: 'text', text: handlePipelineSummary(args) }] })
);

server.tool(
  'stale_listings',
  'Flag active listings that need attention based on days on market, showing activity, and price comparisons to similar sold properties',
  {
    days_threshold: z.number().optional().describe('Minimum days on market to flag (default: 30)'),
  },
  async (args) => ({ content: [{ type: 'text', text: handleStaleListings(args) }] })
);

// ── Start ──
async function main() {
  initializeDb();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
