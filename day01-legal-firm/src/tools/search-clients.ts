import { searchClients } from "../database.js";

export interface SearchClientsInput {
  query: string;
}

export function handleSearchClients(input: SearchClientsInput) {
  const results = searchClients(input.query);

  if (results.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No clients found matching "${input.query}".`,
        },
      ],
    };
  }

  const formatted = results
    .map((client) => {
      const caseList =
        client.cases.length > 0
          ? client.cases
              .map((c) => `    [${c.case_number}] ${c.case_type} - ${c.status} (${c.assigned_attorney})`)
              .join("\n")
          : "    No cases on file.";

      return `${client.name}
  Email: ${client.email}
  Phone: ${client.phone}
  Address: ${client.address ?? "N/A"}
  Client since: ${client.intake_date}
  Cases:
${caseList}`;
    })
    .join("\n\n");

  return {
    content: [
      {
        type: "text" as const,
        text: `Found ${results.length} client(s) matching "${input.query}":\n\n${formatted}`,
      },
    ],
  };
}
