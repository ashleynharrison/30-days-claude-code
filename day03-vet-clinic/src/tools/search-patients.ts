import { searchPatients } from "../database.js";

export function handleSearchPatients(args: { query: string; filters?: { species?: string; status?: string } }) {
  const { query, filters } = args;

  if (!query) {
    return {
      content: [{ type: "text" as const, text: "Please provide a search query (patient name, owner name, or breed)." }],
      isError: true,
    };
  }

  const results = searchPatients(query, filters);

  if (results.length === 0) {
    return {
      content: [{ type: "text" as const, text: `No patients found matching "${query}".` }],
    };
  }

  const formatted = results.map((p) => {
    const age = getAge(p.date_of_birth);
    const allergyFlag = p.allergies ? `\n  ⚠️ ALLERGIES: ${p.allergies}` : "";
    return [
      `${p.name} (${p.species} — ${p.breed})`,
      `  Owner: ${p.owner_name} | ${p.owner_phone} | ${p.owner_email}`,
      `  ${p.sex} | ${age} | ${p.weight_lbs} lbs | Status: ${p.status}`,
      allergyFlag,
    ].filter(Boolean).join("\n");
  });

  return {
    content: [{
      type: "text" as const,
      text: `Found ${results.length} patient(s) matching "${query}":\n\n${formatted.join("\n\n")}`,
    }],
  };
}

function getAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const adjustedYears = months < 0 ? years - 1 : years;
  const adjustedMonths = months < 0 ? months + 12 : months;

  if (adjustedYears === 0) return `${adjustedMonths} months`;
  if (adjustedMonths === 0) return `${adjustedYears} yr`;
  return `${adjustedYears} yr ${adjustedMonths} mo`;
}
