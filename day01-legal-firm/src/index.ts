import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { handleSearchCases } from "./tools/search-cases.js";
import { handleGetCaseDetails } from "./tools/get-case-details.js";
import { handleUpcomingHearings } from "./tools/upcoming-hearings.js";
import { handleOverdueTasks } from "./tools/overdue-tasks.js";
import { handleCaseStats } from "./tools/case-stats.js";
import { handleSearchClients } from "./tools/search-clients.js";

const server = new Server(
  {
    name: "legal-firm",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_cases",
        description:
          "Search for legal cases by keyword. Searches case numbers, client names, and notes. Optionally filter by status, case type, or attorney.",
        inputSchema: {
          type: "object" as const,
          properties: {
            query: {
              type: "string",
              description: "Search term to match against case number, client name, or notes",
            },
            filters: {
              type: "object",
              description: "Optional filters to narrow results",
              properties: {
                status: {
                  type: "string",
                  description: "Filter by case status (Active, Pending, Closed, On Hold)",
                  enum: ["Active", "Pending", "Closed", "On Hold"],
                },
                case_type: {
                  type: "string",
                  description: "Filter by case type",
                  enum: ["Immigration", "Personal Injury", "Family Law", "Criminal Defense", "Civil Litigation"],
                },
                attorney: {
                  type: "string",
                  description: "Filter by assigned attorney name (partial match)",
                },
              },
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_case_details",
        description:
          "Get full details for a specific case including all tasks and client contact information. Provide either case_id or case_number.",
        inputSchema: {
          type: "object" as const,
          properties: {
            case_id: {
              type: "number",
              description: "The numeric ID of the case",
            },
            case_number: {
              type: "string",
              description: "The case number (e.g., 2025-CV-2001)",
            },
          },
        },
      },
      {
        name: "upcoming_hearings",
        description:
          "List all cases with hearings scheduled within the specified number of days, sorted by date.",
        inputSchema: {
          type: "object" as const,
          properties: {
            days_ahead: {
              type: "number",
              description: "Number of days to look ahead (default: 7)",
            },
          },
        },
      },
      {
        name: "overdue_tasks",
        description:
          "List all tasks that are past their due date and not yet complete. Optionally filter by person assigned.",
        inputSchema: {
          type: "object" as const,
          properties: {
            assigned_to: {
              type: "string",
              description: "Filter by person assigned (partial match, e.g., 'Jamie' or 'Gutierrez')",
            },
          },
        },
      },
      {
        name: "case_stats",
        description:
          "Get an overview of firm statistics: total active cases, breakdown by type and attorney, upcoming hearings count, and overdue task count.",
        inputSchema: {
          type: "object" as const,
          properties: {},
        },
      },
      {
        name: "search_clients",
        description:
          "Search for clients by name or email. Returns client details and their associated cases.",
        inputSchema: {
          type: "object" as const,
          properties: {
            query: {
              type: "string",
              description: "Search term to match against client name or email",
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "search_cases":
      return handleSearchCases(args as { query: string; filters?: { status?: string; case_type?: string; attorney?: string } });

    case "get_case_details":
      return handleGetCaseDetails(args as { case_id?: number; case_number?: string });

    case "upcoming_hearings":
      return handleUpcomingHearings(args as { days_ahead?: number });

    case "overdue_tasks":
      return handleOverdueTasks(args as { assigned_to?: string });

    case "case_stats":
      return handleCaseStats();

    case "search_clients":
      return handleSearchClients(args as { query: string });

    default:
      return {
        content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Legal Firm MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
