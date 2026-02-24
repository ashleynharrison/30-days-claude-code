import { getCaseDetails } from "../database.js";

export interface GetCaseDetailsInput {
  case_id?: number;
  case_number?: string;
}

export function handleGetCaseDetails(input: GetCaseDetailsInput) {
  const identifier = input.case_id ?? input.case_number;

  if (!identifier) {
    return {
      content: [
        {
          type: "text" as const,
          text: "Error: Please provide either a case_id (number) or case_number (string).",
        },
      ],
      isError: true,
    };
  }

  const result = getCaseDetails(identifier);

  if (!result) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No case found with ${input.case_id ? `ID ${input.case_id}` : `number "${input.case_number}"`}.`,
        },
      ],
    };
  }

  const taskList =
    result.tasks.length > 0
      ? result.tasks
          .map(
            (t) =>
              `  - [${t.status}] ${t.description}\n    Assigned: ${t.assigned_to} | Due: ${t.due_date} | Priority: ${t.priority}`
          )
          .join("\n")
      : "  No tasks assigned.";

  const clientInfo = result.client
    ? `\nClient Contact:\n  Email: ${result.client.email}\n  Phone: ${result.client.phone}\n  Address: ${result.client.address ?? "N/A"}\n  Intake Date: ${result.client.intake_date}`
    : "\nClient contact info not found in system.";

  const text = `Case Details: ${result.case_number}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Client: ${result.client_name}
Type: ${result.case_type}
Status: ${result.status}
Attorney: ${result.assigned_attorney}
Opposing Counsel: ${result.opposing_counsel ?? "N/A"}
Court: ${result.court ?? "N/A"}
Filed: ${result.filed_date}
Next Hearing: ${result.next_hearing_date ?? "None scheduled"}${result.next_hearing_type ? ` (${result.next_hearing_type})` : ""}

Notes:
  ${result.notes ?? "No notes."}
${clientInfo}

Tasks (${result.tasks.length}):
${taskList}`;

  return {
    content: [{ type: "text" as const, text }],
  };
}
