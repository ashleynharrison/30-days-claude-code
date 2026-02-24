import { searchCases, CaseSearchFilters } from "../database.js";

export interface SearchCasesInput {
  query: string;
  filters?: CaseSearchFilters;
}

export function handleSearchCases(input: SearchCasesInput) {
  const results = searchCases(input.query, input.filters);

  if (results.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No cases found matching "${input.query}"${input.filters ? " with the specified filters" : ""}.`,
        },
      ],
    };
  }

  const formatted = results
    .map(
      (c) =>
        `[${c.case_number}] ${c.client_name}\n  Type: ${c.case_type} | Status: ${c.status}\n  Attorney: ${c.assigned_attorney}\n  Next Hearing: ${c.next_hearing_date ?? "None scheduled"}`
    )
    .join("\n\n");

  return {
    content: [
      {
        type: "text" as const,
        text: `Found ${results.length} case(s) matching "${input.query}":\n\n${formatted}`,
      },
    ],
  };
}
