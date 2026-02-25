export const TOTAL_DAYS = 30;

export const days = [
  {
    day: 1,
    title: 'Legal Firm Case Manager',
    industry: 'Legal',
    description: 'An MCP server that connects case management data to Claude. Search cases, track hearings, and surface overdue tasks.',
    icon: 'Scale',
    tools: 6,
    status: 'shipped' as const,
  },
  {
    day: 2,
    title: 'SaaS Billing Support',
    industry: 'SaaS / FinOps',
    description: 'A billing support tool that lets reps query customer accounts, invoices, and transactions through natural language.',
    icon: 'CreditCard',
    tools: 6,
    status: 'shipped' as const,
  },
];

export const shippedCount = days.length;
