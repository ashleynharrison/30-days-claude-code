import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerStudentLookup } from './tools/student-lookup.js';
import { registerCourseRoster } from './tools/course-roster.js';
import { registerGradeBook } from './tools/grade-book.js';
import { registerAtRiskStudents } from './tools/at-risk-students.js';
import { registerAssignmentTracker } from './tools/assignment-tracker.js';
import { registerCourseAnalytics } from './tools/course-analytics.js';

const server = new McpServer({
  name: 'Education Course & Student Manager',
  version: '1.0.0',
});

registerStudentLookup(server);
registerCourseRoster(server);
registerGradeBook(server);
registerAtRiskStudents(server);
registerAssignmentTracker(server);
registerCourseAnalytics(server);

const transport = new StdioServerTransport();
await server.connect(transport);
