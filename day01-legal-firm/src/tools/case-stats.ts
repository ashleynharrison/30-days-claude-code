import { getCaseStats } from "../database.js";

export function handleCaseStats() {
  const stats = getCaseStats();

  const byType = Object.entries(stats.cases_by_type)
    .map(([type, count]) => `  ${type}: ${count}`)
    .join("\n");

  const byAttorney = Object.entries(stats.cases_by_attorney)
    .map(([attorney, count]) => `  ${attorney}: ${count}`)
    .join("\n");

  const text = `Firm Case Statistics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Active Cases: ${stats.total_active_cases}

Cases by Type (all statuses):
${byType}

Active Cases by Attorney:
${byAttorney}

Upcoming Hearings (next 7 days): ${stats.upcoming_hearings_7_days}
Overdue Tasks: ${stats.overdue_tasks}`;

  return {
    content: [{ type: "text" as const, text }],
  };
}
