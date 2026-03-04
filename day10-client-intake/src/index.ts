import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { clientSearch } from './tools/client-search.js';
import { intakeReview } from './tools/intake-review.js';
import { conflictChecker } from './tools/conflict-checker.js';
import { engagementTracker } from './tools/engagement-tracker.js';
import { workflowStatus } from './tools/workflow-status.js';
import { documentTracker } from './tools/document-tracker.js';

const server = new McpServer({
  name: 'client-intake',
  version: '1.0.0',
});

// Tool 1: Client Search
server.tool(
  'client_search',
  'Search and browse clients at any stage of intake — prospects, in-progress, onboarded, declined, or withdrawn.',
  {
    query: z.string().optional().describe('Search by name, company, or email (partial match)'),
    status: z.enum(['prospect', 'intake_in_progress', 'engagement_sent', 'conflict_review', 'onboarded', 'declined', 'withdrawn']).optional().describe('Filter by client status'),
    practice_area: z.string().optional().describe('Filter by practice area (partial match, e.g. "corporate", "employment")'),
    assigned_attorney: z.string().optional().describe('Filter by assigned attorney name (partial match)'),
  },
  async (params) => {
    const result = clientSearch(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

// Tool 2: Intake Review
server.tool(
  'intake_review',
  'Review intake forms submitted by clients. See form data, flags, and approval status. Filter to find forms that need attention.',
  {
    client_id: z.number().optional().describe('Filter by specific client ID'),
    status: z.enum(['pending', 'submitted', 'under_review', 'approved', 'rejected']).optional().describe('Filter by form status'),
    flagged_only: z.boolean().optional().describe('Show only forms with flags/concerns (default: false)'),
  },
  async (params) => {
    const result = intakeReview(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

// Tool 3: Conflict Checker
server.tool(
  'conflict_checker',
  'Check conflict of interest status for clients. Shows pending checks, found conflicts, and resolutions. Critical for ethics compliance.',
  {
    client_id: z.number().optional().describe('Check conflicts for a specific client'),
    status: z.enum(['pending', 'cleared', 'conflict_found', 'conflict_confirmed']).optional().describe('Filter by conflict check status'),
    show_all: z.boolean().optional().describe('Show all checks including cleared (default: shows only actionable items)'),
  },
  async (params) => {
    const result = conflictChecker(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

// Tool 4: Engagement Tracker
server.tool(
  'engagement_tracker',
  'Track engagement letters — drafts, sent, signed, and expired. See fee structures, retainer amounts, and signature status.',
  {
    client_id: z.number().optional().describe('Filter by specific client ID'),
    status: z.enum(['draft', 'sent', 'signed', 'expired']).optional().describe('Filter by engagement status'),
    fee_structure: z.string().optional().describe('Filter by fee type (e.g. "retainer", "hourly", "flat")'),
  },
  async (params) => {
    const result = engagementTracker(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

// Tool 5: Workflow Status
server.tool(
  'workflow_status',
  'Track the intake workflow for each client — see which steps are completed, in progress, blocked, or overdue. Shows progress bars and blockers.',
  {
    client_id: z.number().optional().describe('Show workflow for a specific client'),
    assigned_to: z.string().optional().describe('Filter steps by assignee name (partial match)'),
    show_blocked: z.boolean().optional().describe('Show only blocked steps'),
    show_overdue: z.boolean().optional().describe('Show only overdue steps'),
  },
  async (params) => {
    const result = workflowStatus(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

// Tool 6: Document Tracker
server.tool(
  'document_tracker',
  'Track documents collected during client intake — uploaded files, review status, and flags. See what\'s been reviewed and what needs attention.',
  {
    client_id: z.number().optional().describe('Filter documents by client ID'),
    status: z.enum(['pending_review', 'reviewed', 'flagged']).optional().describe('Filter by document review status'),
    doc_type: z.string().optional().describe('Filter by document type (partial match, e.g. "corporate", "financial")'),
  },
  async (params) => {
    const result = documentTracker(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Client Intake MCP server running on stdio');
}

main().catch(console.error);
