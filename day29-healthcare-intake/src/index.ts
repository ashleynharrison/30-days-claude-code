import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerPatientIntakeStatus } from './tools/patient-intake-status.js';
import { registerNewPatientForm } from './tools/new-patient-form.js';
import { registerInsuranceVerification } from './tools/insurance-verification.js';
import { registerAppointmentScheduler } from './tools/appointment-scheduler.js';
import { registerConsentTracker } from './tools/consent-tracker.js';
import { registerIntakeQueue } from './tools/intake-queue.js';

const server = new McpServer({
  name: 'Day 29 — Healthcare Patient Intake',
  version: '1.0.0',
});

registerPatientIntakeStatus(server);
registerNewPatientForm(server);
registerInsuranceVerification(server);
registerAppointmentScheduler(server);
registerConsentTracker(server);
registerIntakeQueue(server);

const transport = new StdioServerTransport();
await server.connect(transport);
