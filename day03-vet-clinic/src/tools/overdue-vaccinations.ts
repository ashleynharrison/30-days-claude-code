import { getOverdueVaccinations } from "../database.js";

export function handleOverdueVaccinations(args: { include_due_soon?: boolean }) {
  const includeDueSoon = args.include_due_soon !== false; // default true
  const results = getOverdueVaccinations(includeDueSoon);

  if (results.length === 0) {
    return {
      content: [{
        type: "text" as const,
        text: includeDueSoon
          ? "No patients have overdue or upcoming vaccinations. All caught up!"
          : "No patients have overdue vaccinations.",
      }],
    };
  }

  // Group by patient
  const byPatient = new Map<number, typeof results>();
  for (const r of results) {
    const existing = byPatient.get(r.patient_id) || [];
    existing.push(r);
    byPatient.set(r.patient_id, existing);
  }

  const overdue = results.filter((r) => r.status === "Overdue");
  const dueSoon = results.filter((r) => r.status === "Due Soon");

  let output = `## Vaccination Alerts\n\n`;
  output += `🔴 Overdue: ${overdue.length} vaccine(s) across ${new Set(overdue.map((r) => r.patient_id)).size} patient(s)\n`;
  if (includeDueSoon) {
    output += `🟡 Due Soon (within 14 days): ${dueSoon.length} vaccine(s) across ${new Set(dueSoon.map((r) => r.patient_id)).size} patient(s)\n`;
  }

  output += "\n---\n\n";

  for (const [, patientVaccines] of byPatient) {
    const first = patientVaccines[0];
    output += `### ${first.patient_name} (${first.species} — ${first.breed})\n`;
    output += `Owner: ${first.owner_name} | ${first.owner_phone} | ${first.owner_email}\n\n`;

    for (const v of patientVaccines) {
      const icon = v.status === "Overdue" ? "🔴" : "🟡";
      const daysInfo = getDaysInfo(v.next_due_date);
      output += `${icon} **${v.vaccine_name}** — ${v.status} (due ${v.next_due_date}, ${daysInfo})\n`;
      output += `   Last administered: ${v.date_administered} by ${v.administered_by}\n`;
    }
    output += "\n";
  }

  return {
    content: [{ type: "text" as const, text: output.trim() }],
  };
}

function getDaysInfo(dueDateStr: string): string {
  const due = new Date(dueDateStr);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === 0) return "due today";
  return `${diffDays} days from now`;
}
