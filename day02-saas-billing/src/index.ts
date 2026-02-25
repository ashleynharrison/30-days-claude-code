import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { handleLookupCustomer } from "./tools/lookup-customer.js";
import { handleGetBillingHistory } from "./tools/get-billing-history.js";
import { handleFindDiscrepancies } from "./tools/find-discrepancies.js";
import { handleOpenTickets } from "./tools/open-tickets.js";
import { handleRevenueSummary } from "./tools/revenue-summary.js";
import { handleGetPlanChanges } from "./tools/get-plan-changes.js";

const server = new Server(
  { name: "saas-billing", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// ── Tool Definitions ────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "lookup_customer",
      description:
        "Search for a customer by name, email, or plan. Returns customer details with current plan, MRR, and account status.",
      inputSchema: {
        type: "object" as const,
        properties: {
          query: {
            type: "string",
            description: "Search term — customer name, contact name, or email",
          },
          plan: {
            type: "string",
            enum: ["Starter", "Pro", "Business", "Enterprise"],
            description: "Filter by plan tier",
          },
          status: {
            type: "string",
            enum: ["Active", "Past Due", "Churned", "Trial"],
            description: "Filter by account status",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "get_billing_history",
      description:
        "Full billing history for a customer — invoices and transactions sorted by date with line item details.",
      inputSchema: {
        type: "object" as const,
        properties: {
          customer: {
            type: "string",
            description: "Customer ID (number) or company name (partial match)",
          },
          months_back: {
            type: "number",
            description: "How many months of history to retrieve (default: 3)",
          },
        },
        required: ["customer"],
      },
    },
    {
      name: "find_discrepancies",
      description:
        "Surface billing anomalies for a customer — duplicate charges, failed payments, mismatched amounts, and unusual patterns.",
      inputSchema: {
        type: "object" as const,
        properties: {
          customer: {
            type: "string",
            description: "Customer ID (number) or company name (partial match)",
          },
        },
        required: ["customer"],
      },
    },
    {
      name: "open_tickets",
      description:
        "View support tickets filtered by status, category, or assigned rep. Returns tickets with customer context.",
      inputSchema: {
        type: "object" as const,
        properties: {
          status: {
            type: "string",
            enum: ["Open", "Pending", "Resolved", "Escalated"],
            description: "Filter by ticket status",
          },
          category: {
            type: "string",
            enum: [
              "Billing Dispute",
              "Refund Request",
              "Plan Change",
              "Payment Failed",
              "Invoice Question",
              "Cancellation",
            ],
            description: "Filter by ticket category",
          },
          assigned_to: {
            type: "string",
            description: "Filter by support rep name",
          },
        },
      },
    },
    {
      name: "revenue_summary",
      description:
        "MRR and billing metrics overview — total MRR, MRR by plan, customer count by status, failed payments this month, pending refunds, churn count.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
    {
      name: "get_plan_changes",
      description:
        "Track plan changes for a specific customer or across all accounts. Shows upgrades, downgrades, and seat adjustments with proration details.",
      inputSchema: {
        type: "object" as const,
        properties: {
          customer: {
            type: "string",
            description:
              "Customer ID or name (optional — omit for all customers)",
          },
          days_back: {
            type: "number",
            description: "How many days back to look (default: 30)",
          },
        },
      },
    },
  ],
}));

// ── Tool Router ─────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "lookup_customer":
      return handleLookupCustomer(args as { query: string; plan?: string; status?: string });

    case "get_billing_history":
      return handleGetBillingHistory(args as { customer: string; months_back?: number });

    case "find_discrepancies":
      return handleFindDiscrepancies(args as { customer: string });

    case "open_tickets":
      return handleOpenTickets(args as { status?: string; category?: string; assigned_to?: string });

    case "revenue_summary":
      return handleRevenueSummary();

    case "get_plan_changes":
      return handleGetPlanChanges(args as { customer?: string; days_back?: number });

    default:
      return {
        content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
});

// ── Start Server ────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
