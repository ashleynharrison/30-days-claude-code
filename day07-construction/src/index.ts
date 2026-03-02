import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { projectOverview } from './tools/project-overview.js';
import { subcontractorStatus } from './tools/subcontractor-status.js';
import { inspectionTracker } from './tools/inspection-tracker.js';
import { rfiStatus } from './tools/rfi-status.js';
import { changeOrderLog } from './tools/change-order-log.js';
import { dailyLogViewer } from './tools/daily-log-viewer.js';

const server = new McpServer({
  name: 'construction-project-tracker',
  version: '1.0.0',
});

// Tool 1: Project Overview
server.tool(
  'project_overview',
  'Search and view construction projects — budget vs. spend, completion percentage, open RFIs, upcoming inspections, and change order totals.',
  {
    name: z.string().optional().describe('Search by project name (partial match)'),
    status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional().describe('Filter by project status'),
    project_type: z.enum(['residential', 'commercial', 'renovation', 'infrastructure']).optional().describe('Filter by project type'),
  },
  async (args) => ({
    content: [{ type: 'text', text: projectOverview(args) }],
  })
);

// Tool 2: Subcontractor Status
server.tool(
  'subcontractor_status',
  'View subcontractors across projects — trade, contract value, insurance expiry, failed inspections. Filter by project, trade, or status.',
  {
    project_id: z.number().optional().describe('Filter by project ID'),
    trade: z.string().optional().describe('Filter by trade (e.g., electrical, plumbing, concrete)'),
    status: z.enum(['active', 'completed', 'terminated', 'pending']).optional().describe('Filter by subcontractor status'),
  },
  async (args) => ({
    content: [{ type: 'text', text: subcontractorStatus(args) }],
  })
);

// Tool 3: Inspection Tracker
server.tool(
  'inspection_tracker',
  'Track inspections — scheduled, passed, failed, and conditional results with correction deadlines. Filter by project, status, result, or date range.',
  {
    project_id: z.number().optional().describe('Filter by project ID'),
    status: z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled']).optional().describe('Filter by inspection status'),
    result: z.enum(['passed', 'failed', 'conditional', 'pending']).optional().describe('Filter by inspection result'),
    date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
  },
  async (args) => ({
    content: [{ type: 'text', text: inspectionTracker(args) }],
  })
);

// Tool 4: RFI Status
server.tool(
  'rfi_status',
  'Track Requests for Information — open, answered, and closed RFIs with priority, days open, and responses. Filter by project, status, or priority.',
  {
    project_id: z.number().optional().describe('Filter by project ID'),
    status: z.enum(['open', 'answered', 'closed', 'void']).optional().describe('Filter by RFI status'),
    priority: z.enum(['critical', 'high', 'medium', 'low']).optional().describe('Filter by priority level'),
  },
  async (args) => ({
    content: [{ type: 'text', text: rfiStatus(args) }],
  })
);

// Tool 5: Change Order Log
server.tool(
  'change_order_log',
  'View change orders — amounts, reasons, schedule impact, and approval status. See totals per project and percentage of original contract.',
  {
    project_id: z.number().optional().describe('Filter by project ID'),
    status: z.enum(['pending', 'approved', 'rejected', 'negotiating']).optional().describe('Filter by change order status'),
  },
  async (args) => ({
    content: [{ type: 'text', text: changeOrderLog(args) }],
  })
);

// Tool 6: Daily Log Viewer
server.tool(
  'daily_log',
  'Read daily construction logs — weather, crew counts, work performed, materials delivered, delays, safety incidents, and superintendent notes.',
  {
    project_id: z.number().optional().describe('Filter by project ID'),
    date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
  },
  async (args) => ({
    content: [{ type: 'text', text: dailyLogViewer(args) }],
  })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
