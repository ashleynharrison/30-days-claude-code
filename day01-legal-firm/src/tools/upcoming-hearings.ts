import { getUpcomingHearings } from "../database.js";

export interface UpcomingHearingsInput {
  days_ahead?: number;
}

export function handleUpcomingHearings(input: UpcomingHearingsInput) {
  const daysAhead = input.days_ahead ?? 7;
  const results = getUpcomingHearings(daysAhead);

  if (results.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No hearings scheduled in the next ${daysAhead} day(s).`,
        },
      ],
    };
  }

  const formatted = results
    .map(
      (c) =>
        `${c.next_hearing_date} - ${c.next_hearing_type ?? "Hearing"}\n  Case: [${c.case_number}] ${c.client_name}\n  Type: ${c.case_type} | Attorney: ${c.assigned_attorney}\n  Court: ${c.court ?? "TBD"}`
    )
    .join("\n\n");

  return {
    content: [
      {
        type: "text" as const,
        text: `Upcoming hearings in the next ${daysAhead} day(s) (${results.length} total):\n\n${formatted}`,
      },
    ],
  };
}
