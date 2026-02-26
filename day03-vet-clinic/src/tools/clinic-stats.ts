import { getClinicStats } from "../database.js";

export function handleClinicStats() {
  const stats = getClinicStats();

  const speciesLines = Object.entries(stats.species_breakdown)
    .map(([species, count]) => `  ${species}: ${count}`)
    .join("\n");

  const output = [
    "## Clinic Dashboard",
    "",
    `**Active Patients:** ${stats.total_active_patients}`,
    `**Appointments This Week:** ${stats.appointments_this_week}`,
    `**Overdue Vaccinations:** ${stats.overdue_vaccinations}`,
    "",
    `**Revenue This Month:** $${stats.revenue_this_month.toFixed(2)}`,
    `**Outstanding (Unpaid) This Month:** $${stats.outstanding_this_month.toFixed(2)}`,
    `**No-Show Rate:** ${stats.no_show_rate}`,
    "",
    "**Species Breakdown:**",
    speciesLines,
  ].join("\n");

  return {
    content: [{ type: "text" as const, text: output }],
  };
}
