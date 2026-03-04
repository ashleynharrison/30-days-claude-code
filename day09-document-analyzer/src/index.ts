import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { documentSearch } from './tools/document-search.js';
import { partyLookup } from './tools/party-lookup.js';
import { keyDatesTracker } from './tools/key-dates-tracker.js';
import { obligationTracker } from './tools/obligation-tracker.js';
import { clauseAnalyzer } from './tools/clause-analyzer.js';
import { redFlags } from './tools/red-flags.js';

const server = new McpServer({
  name: 'document-analyzer',
  version: '1.0.0',
});

// Tool 1: Document Search
server.tool(
  'document_search',
  'Search and browse analyzed documents. Filter by title, document type, or status.',
  {
    query: z.string().optional().describe('Search term to match against document titles (partial match)'),
    doc_type: z.enum(['msa', 'nda', 'lease', 'license', 'employment', 'contractor', 'partnership', 'vendor', 'settlement', 'dpa']).optional().describe('Filter by document type'),
    status: z.enum(['active', 'expired', 'executed', 'under_review']).optional().describe('Filter by document status'),
  },
  async (params) => {
    const result = documentSearch(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

// Tool 2: Party Lookup
server.tool(
  'party_lookup',
  'Find parties (companies, individuals) across all documents. Search by name, role, or document.',
  {
    name: z.string().optional().describe('Party name to search for (partial match)'),
    role: z.string().optional().describe('Party role to filter by (partial match, e.g. client, landlord, employer)'),
    document_id: z.number().optional().describe('Filter parties by specific document ID'),
  },
  async (params) => {
    const result = partyLookup(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

// Tool 3: Key Dates Tracker
server.tool(
  'key_dates_tracker',
  'Track deadlines and key dates across documents. Find upcoming deadlines, overdue items, and important milestones.',
  {
    document_id: z.number().optional().describe('Filter dates by specific document ID'),
    upcoming_days: z.number().optional().describe('Show dates within the next N days from today'),
    deadlines_only: z.boolean().optional().describe('If true, only show dates marked as deadlines'),
  },
  async (params) => {
    const result = keyDatesTracker(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

// Tool 4: Obligation Tracker
server.tool(
  'obligation_tracker',
  'Track contractual obligations by party. View what each party is required to do, grouped by document.',
  {
    document_id: z.number().optional().describe('Filter obligations by specific document ID'),
    party_name: z.string().optional().describe('Filter by party name (partial match)'),
    obligation_type: z.string().optional().describe('Filter by obligation type (e.g. payment, insurance, compliance)'),
    status: z.enum(['active', 'completed', 'pending', 'breached']).optional().describe('Filter by obligation status'),
  },
  async (params) => {
    const result = obligationTracker(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

// Tool 5: Clause Analyzer
server.tool(
  'clause_analyzer',
  'Analyze contract clauses across documents. Find specific clause types and assess risk levels.',
  {
    document_id: z.number().optional().describe('Filter clauses by specific document ID'),
    clause_type: z.string().optional().describe('Filter by clause type (partial match, e.g. termination, indemnification, non_compete)'),
    risk_level: z.enum(['low', 'medium', 'high']).optional().describe('Filter by risk level'),
  },
  async (params) => {
    const result = clauseAnalyzer(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

// Tool 6: Red Flags
server.tool(
  'red_flags',
  'Surface red flags and risk items across documents. Identify high-severity issues needing attention.',
  {
    document_id: z.number().optional().describe('Filter red flags by specific document ID'),
    severity: z.enum(['low', 'medium', 'high']).optional().describe('Filter by severity level'),
    category: z.string().optional().describe('Filter by category (partial match, e.g. payment, liability, termination)'),
  },
  async (params) => {
    const result = redFlags(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Document Analyzer MCP server running on stdio');
}

main().catch(console.error);
