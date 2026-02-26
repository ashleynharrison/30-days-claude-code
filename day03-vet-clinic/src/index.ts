import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { handleSearchPatients } from "./tools/search-patients.js";
import { handleGetPatientRecord } from "./tools/get-patient-record.js";
import { handleOverdueVaccinations } from "./tools/overdue-vaccinations.js";
import { handleTodaysSchedule } from "./tools/todays-schedule.js";
import { handleSearchTreatments } from "./tools/search-treatments.js";
import { handleClinicStats } from "./tools/clinic-stats.js";

const server = new Server(
  {
    name: "vet-clinic",
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
        name: "search_patients",
        description:
          "Search for pets by name, owner name, species, or breed. Returns patient details with owner contact info.",
        inputSchema: {
          type: "object" as const,
          properties: {
            query: {
              type: "string",
              description: "Search term to match against patient name, owner name, or breed",
            },
            filters: {
              type: "object",
              description: "Optional filters to narrow results",
              properties: {
                species: {
                  type: "string",
                  description: "Filter by species",
                  enum: ["Dog", "Cat", "Rabbit", "Bird", "Reptile"],
                },
                status: {
                  type: "string",
                  description: "Filter by patient status",
                  enum: ["Active", "Deceased", "Transferred"],
                },
              },
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_patient_record",
        description:
          "Get a full medical record for a patient including vaccination status, recent treatments, upcoming appointments, weight history, and allergy alerts. Provide patient_id or patient_name (with optional owner_name if ambiguous).",
        inputSchema: {
          type: "object" as const,
          properties: {
            patient_id: {
              type: "number",
              description: "The numeric ID of the patient",
            },
            patient_name: {
              type: "string",
              description: "The pet's name (partial match supported)",
            },
            owner_name: {
              type: "string",
              description: "Owner's name to disambiguate if multiple pets share a name",
            },
          },
        },
      },
      {
        name: "overdue_vaccinations",
        description:
          "List all patients with overdue vaccinations or vaccinations due within 14 days. Includes owner contact info for sending reminders.",
        inputSchema: {
          type: "object" as const,
          properties: {
            include_due_soon: {
              type: "boolean",
              description: "Include vaccines due within 14 days (default: true). Set to false to show only overdue.",
            },
          },
        },
      },
      {
        name: "todays_schedule",
        description:
          "Get the appointment schedule for today or a specific date. Optionally filter by veterinarian. Shows patient info, appointment type, reason, and allergy alerts.",
        inputSchema: {
          type: "object" as const,
          properties: {
            date: {
              type: "string",
              description: "Date in YYYY-MM-DD format (default: today)",
            },
            veterinarian: {
              type: "string",
              description: "Filter by veterinarian name (partial match, e.g., 'Huang' or 'Webb')",
            },
          },
        },
      },
      {
        name: "search_treatments",
        description:
          "Search treatment history by diagnosis, medication, or description. Optionally filter by patient.",
        inputSchema: {
          type: "object" as const,
          properties: {
            query: {
              type: "string",
              description: "Search term to match against treatment description, diagnosis, or medications",
            },
            patient_id: {
              type: "number",
              description: "Optionally filter to a specific patient",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "clinic_stats",
        description:
          "Get a clinic dashboard summary: active patients, appointments this week, overdue vaccinations, revenue and outstanding balance this month, no-show rate, and species breakdown.",
        inputSchema: {
          type: "object" as const,
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "search_patients":
      return handleSearchPatients(args as { query: string; filters?: { species?: string; status?: string } });

    case "get_patient_record":
      return handleGetPatientRecord(args as { patient_id?: number; patient_name?: string; owner_name?: string });

    case "overdue_vaccinations":
      return handleOverdueVaccinations(args as { include_due_soon?: boolean });

    case "todays_schedule":
      return handleTodaysSchedule(args as { date?: string; veterinarian?: string });

    case "search_treatments":
      return handleSearchTreatments(args as { query: string; patient_id?: number });

    case "clinic_stats":
      return handleClinicStats();

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
  console.error("Vet Clinic MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
