import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { reservationLookup } from './tools/reservation-lookup.js';
import { menuPerformance } from './tools/menu-performance.js';
import { staffSchedule } from './tools/staff-schedule.js';
import { serviceRecap } from './tools/service-recap.js';
import { eightySixStatus } from './tools/eighty-six-status.js';
import { tableStatus } from './tools/table-status.js';

const server = new McpServer({
  name: 'restaurant-manager',
  version: '1.0.0',
});

// Tool 1: Reservation Lookup
server.tool(
  'reservation_lookup',
  'Search reservations by date, guest name, party size, or status. Use upcoming_only to see unfinished reservations.',
  {
    date: z.string().optional().describe('Filter by date (YYYY-MM-DD)'),
    guest_name: z.string().optional().describe('Search guest name (partial match)'),
    party_size_min: z.number().optional().describe('Minimum party size'),
    status: z.enum(['confirmed', 'seated', 'completed', 'no_show', 'cancelled']).optional().describe('Filter by reservation status'),
    upcoming_only: z.boolean().optional().describe('Show only confirmed and seated reservations'),
  },
  async (args) => ({
    content: [{ type: 'text', text: reservationLookup(args) }],
  })
);

// Tool 2: Menu Performance
server.tool(
  'menu_performance',
  'Analyze menu item performance — see top sellers, revenue drivers, and profit margins. Filter by date range or category.',
  {
    date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
    category: z.enum(['appetizer', 'entree', 'dessert', 'drink', 'side']).optional().describe('Filter by menu category'),
    sort_by: z.enum(['revenue', 'quantity', 'margin']).optional().describe('Sort results by metric (default: revenue)'),
    limit: z.number().optional().describe('Max number of results (default: 15)'),
  },
  async (args) => ({
    content: [{ type: 'text', text: menuPerformance(args) }],
  })
);

// Tool 3: Staff Schedule
server.tool(
  'staff_schedule',
  'View staff schedules — who is working, what shifts are scheduled, clock-in/out times. Filter by date, role, or name.',
  {
    date: z.string().optional().describe('Filter by date (YYYY-MM-DD)'),
    role: z.enum(['server', 'cook', 'host', 'bartender', 'manager', 'busser']).optional().describe('Filter by staff role'),
    staff_name: z.string().optional().describe('Search by staff name (partial match)'),
  },
  async (args) => ({
    content: [{ type: 'text', text: staffSchedule(args) }],
  })
);

// Tool 4: Service Recap
server.tool(
  'service_recap',
  "Get a full nightly service recap — covers, revenue, avg check, turn time, no-shows, top sellers, 86'd items, and server performance.",
  {
    date: z.string().describe('Date to recap (YYYY-MM-DD)'),
  },
  async (args) => ({
    content: [{ type: 'text', text: serviceRecap(args) }],
  })
);

// Tool 5: 86'd Status
server.tool(
  'eighty_six_status',
  "Check what menu items are currently 86'd (unavailable) and recent 86 history with reasons.",
  {},
  async () => ({
    content: [{ type: 'text', text: eightySixStatus() }],
  })
);

// Tool 6: Table Status
server.tool(
  'table_status',
  'Real-time floor view — see which tables are open, occupied, reserved, or being cleaned. Shows current guests, time seated, and pending items.',
  {},
  async () => ({
    content: [{ type: 'text', text: tableStatus() }],
  })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
