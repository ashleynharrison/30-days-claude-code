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
  {
    day: 3,
    title: 'Veterinary Clinic',
    industry: 'Veterinary / Healthcare',
    description: 'A vet clinic MCP server for patient records, vaccinations, appointments, treatments, and clinic stats.',
    icon: 'Heart',
    tools: 6,
    status: 'shipped' as const,
  },
  {
    day: 4,
    title: 'Real Estate Agency',
    industry: 'Real Estate',
    description: 'A real estate MCP server for listings, clients, showings, offers, and deal pipeline tracking.',
    icon: 'Home',
    tools: 6,
    status: 'shipped' as const,
  },
  {
    day: 5,
    title: 'Restaurant & Hospitality Manager',
    industry: 'Restaurants / Hospitality',
    description: 'A restaurant MCP server for reservations, menu performance, staff scheduling, table status, service recaps, and 86\'d items.',
    icon: 'UtensilsCrossed',
    tools: 6,
    status: 'shipped' as const,
  },
  {
    day: 6,
    title: 'Fitness Studio & Gym Manager',
    industry: 'Fitness / Wellness',
    description: 'A fitness studio MCP server for member management, class scheduling, attendance tracking, at-risk member alerts, instructor performance, and revenue insights.',
    icon: 'Dumbbell',
    tools: 6,
    status: 'shipped' as const,
  },
];

export const shippedCount = days.filter((d) => d.status === 'shipped').length;
