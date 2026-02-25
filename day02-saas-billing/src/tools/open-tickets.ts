import { getTickets } from "../database.js";

export interface OpenTicketsInput {
  status?: string;
  category?: string;
  assigned_to?: string;
}

export function handleOpenTickets(input: OpenTicketsInput) {
  const tickets = getTickets({
    status: input.status,
    category: input.category,
    assigned_to: input.assigned_to,
  });

  if (tickets.length === 0) {
    const filters = [
      input.status && `status: ${input.status}`,
      input.category && `category: ${input.category}`,
      input.assigned_to && `assigned to: ${input.assigned_to}`,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      content: [
        {
          type: "text" as const,
          text: `No tickets found${filters ? ` matching ${filters}` : ""}.`,
        },
      ],
    };
  }

  const formatted = tickets
    .map(
      (t) =>
        `━━━ ${t.ticket_number} ━━━
Subject: ${t.subject}
Customer: ${t.customer_name} (${t.customer_plan})
Category: ${t.category} | Status: ${t.status}
Assigned: ${t.assigned_to}
Created: ${t.created_date}${t.resolved_date ? ` | Resolved: ${t.resolved_date}` : ""}${t.notes ? `\nNotes: ${t.notes}` : ""}`
    )
    .join("\n\n");

  return {
    content: [
      {
        type: "text" as const,
        text: `Found ${tickets.length} ticket(s):\n\n${formatted}`,
      },
    ],
  };
}
