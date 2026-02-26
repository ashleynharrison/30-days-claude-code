import { searchTreatments } from "../database.js";

export function handleSearchTreatments(args: { query: string; patient_id?: number }) {
  const { query, patient_id } = args;

  if (!query) {
    return {
      content: [{ type: "text" as const, text: "Please provide a search query (diagnosis, medication, or description)." }],
      isError: true,
    };
  }

  const results = searchTreatments(query, patient_id);

  if (results.length === 0) {
    return {
      content: [{ type: "text" as const, text: `No treatments found matching "${query}".` }],
    };
  }

  let output = `Found ${results.length} treatment(s) matching "${query}":\n\n`;

  for (const t of results) {
    const diag = t.diagnosis ? `\n  Diagnosis: ${t.diagnosis}` : "";
    const meds = t.medications ? `\n  Medications: ${formatMeds(t.medications)}` : "";
    const paidStatus = t.paid ? "" : " [UNPAID]";

    output += `**${t.date}** — ${t.patient_name} (${t.species}) — ${t.owner_name}\n`;
    output += `  ${t.description}${diag}${meds}\n`;
    output += `  Cost: $${t.cost.toFixed(2)}${paidStatus} | Vet: ${t.veterinarian}\n\n`;
  }

  return {
    content: [{ type: "text" as const, text: output.trim() }],
  };
}

function formatMeds(medsJson: string): string {
  try {
    const meds = JSON.parse(medsJson) as { name: string; dose: string; frequency: string }[];
    return meds.map((m) => `${m.name} ${m.dose} ${m.frequency}`).join(", ");
  } catch {
    return medsJson;
  }
}
