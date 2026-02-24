import { getOverdueTasks } from "../database.js";

export interface OverdueTasksInput {
  assigned_to?: string;
}

export function handleOverdueTasks(input: OverdueTasksInput) {
  const results = getOverdueTasks(input.assigned_to);

  if (results.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: input.assigned_to
            ? `No overdue tasks found for "${input.assigned_to}".`
            : "No overdue tasks found.",
        },
      ],
    };
  }

  const formatted = results
    .map(
      (t) =>
        `[OVERDUE: ${t.due_date}] ${t.description}\n  Case: [${t.case_number}] ${t.client_name} (${t.case_type})\n  Assigned: ${t.assigned_to} | Priority: ${t.priority} | Status: ${t.status}`
    )
    .join("\n\n");

  return {
    content: [
      {
        type: "text" as const,
        text: `Overdue tasks${input.assigned_to ? ` for "${input.assigned_to}"` : ""} (${results.length} total):\n\n${formatted}`,
      },
    ],
  };
}
