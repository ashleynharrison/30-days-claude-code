import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { memberLookup } from './tools/member-lookup.js';
import { classSchedule } from './tools/class-schedule.js';
import { attendanceReport } from './tools/attendance-report.js';
import { atRiskMembers } from './tools/at-risk-members.js';
import { instructorStats } from './tools/instructor-stats.js';
import { revenueSnapshot } from './tools/revenue-snapshot.js';

const server = new McpServer({
  name: 'fitness-studio-manager',
  version: '1.0.0',
});

// Tool 1: Member Lookup
server.tool(
  'member_lookup',
  'Search members by name, membership type, status, or join date. Returns activity stats, remaining classes, and notes.',
  {
    name: z.string().optional().describe('Search by member name (partial match)'),
    membership_type: z.enum(['unlimited_monthly', 'unlimited_annual', 'class_pack_10', 'class_pack_20', 'drop_in']).optional().describe('Filter by membership type'),
    status: z.enum(['active', 'frozen', 'cancelled', 'expired']).optional().describe('Filter by membership status'),
    joined_after: z.string().optional().describe('Members who joined after this date (YYYY-MM-DD)'),
    joined_before: z.string().optional().describe('Members who joined before this date (YYYY-MM-DD)'),
  },
  async (args) => ({
    content: [{ type: 'text', text: memberLookup(args) }],
  })
);

// Tool 2: Class Schedule
server.tool(
  'class_schedule',
  'View the class schedule — upcoming and past sessions with booking counts, instructor, room, and availability. Filter by date range, class type, instructor, or day of week.',
  {
    date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
    class_type: z.enum(['yoga', 'hiit', 'spin', 'strength', 'pilates', 'boxing', 'barre', 'meditation']).optional().describe('Filter by class type'),
    instructor_name: z.string().optional().describe('Filter by instructor name (partial match)'),
    day_of_week: z.number().min(0).max(6).optional().describe('Filter by day of week (0=Sunday, 6=Saturday)'),
  },
  async (args) => ({
    content: [{ type: 'text', text: classSchedule(args) }],
  })
);

// Tool 3: Attendance Report
server.tool(
  'attendance_report',
  'Attendance analytics — total sessions, attendance rates, no-show rates, fill rates by class, and popular time slots. Filter by date range or class type.',
  {
    date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
    class_type: z.enum(['yoga', 'hiit', 'spin', 'strength', 'pilates', 'boxing', 'barre', 'meditation']).optional().describe('Filter by class type'),
  },
  async (args) => ({
    content: [{ type: 'text', text: attendanceReport(args) }],
  })
);

// Tool 4: At-Risk Members
server.tool(
  'at_risk_members',
  'Identify members who haven\'t visited in a while — shows days since last visit, recent activity trends, upcoming renewals, and revenue at risk.',
  {
    days_inactive: z.number().optional().describe('Minimum days since last visit to flag as at-risk (default: 21)'),
  },
  async (args) => ({
    content: [{ type: 'text', text: atRiskMembers(args) }],
  })
);

// Tool 5: Instructor Stats
server.tool(
  'instructor_stats',
  'Instructor performance — classes taught, avg attendance, fill rates, no-shows, and cost per attendee. Filter by date range or instructor name.',
  {
    date_from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    date_to: z.string().optional().describe('End date (YYYY-MM-DD)'),
    instructor_name: z.string().optional().describe('Filter by instructor name (partial match)'),
  },
  async (args) => ({
    content: [{ type: 'text', text: instructorStats(args) }],
  })
);

// Tool 6: Revenue Snapshot
server.tool(
  'revenue_snapshot',
  'Revenue overview — membership revenue by type, expiring class packs, upcoming renewals, and frozen membership revenue.',
  {},
  async () => ({
    content: [{ type: 'text', text: revenueSnapshot() }],
  })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
