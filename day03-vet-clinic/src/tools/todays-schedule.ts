import { getTodaysSchedule } from "../database.js";

export function handleTodaysSchedule(args: { date?: string; veterinarian?: string }) {
  const { date, veterinarian } = args;
  const targetDate = date || new Date().toISOString().split("T")[0];
  const results = getTodaysSchedule(date, veterinarian);

  const dateLabel = targetDate === new Date().toISOString().split("T")[0] ? "Today" : targetDate;
  const vetFilter = veterinarian ? ` (${veterinarian})` : "";

  if (results.length === 0) {
    return {
      content: [{
        type: "text" as const,
        text: `No appointments scheduled for ${dateLabel}${vetFilter}.`,
      }],
    };
  }

  let output = `## Schedule for ${dateLabel}${vetFilter}\n\n`;
  output += `${results.length} appointment(s)\n\n`;

  for (const a of results) {
    const time = a.appointment_datetime.split("T")[1]?.substring(0, 5) || "";
    const allergyFlag = a.allergies ? ` ⚠️ ALLERGIES: ${a.allergies}` : "";
    const statusBadge = a.status === "Scheduled" ? "" : ` [${a.status}]`;

    output += `**${time}** — ${a.patient_name} (${a.species} — ${a.breed})${statusBadge}\n`;
    output += `  Type: ${a.type} | Reason: ${a.reason}\n`;
    output += `  Vet: ${a.veterinarian} | Owner: ${a.owner_name} (${a.owner_phone})\n`;
    if (allergyFlag) output += `  ${allergyFlag}\n`;
    output += "\n";
  }

  return {
    content: [{ type: "text" as const, text: output.trim() }],
  };
}
