import { getPatientRecord } from "../database.js";

export function handleGetPatientRecord(args: { patient_id?: number; patient_name?: string; owner_name?: string }) {
  const { patient_id, patient_name, owner_name } = args;

  if (!patient_id && !patient_name) {
    return {
      content: [{ type: "text" as const, text: "Please provide either a patient_id or patient_name." }],
      isError: true,
    };
  }

  const record = getPatientRecord(patient_id, patient_name, owner_name);

  if (!record) {
    return {
      content: [{ type: "text" as const, text: "Patient not found." }],
    };
  }

  const { patient, vaccinations, recentTreatments, upcomingAppointments, weightHistory } = record;

  const age = getAge(patient.date_of_birth);

  // Build allergy banner
  const allergyBanner = patient.allergies
    ? `\n${"=".repeat(50)}\n⚠️  ALLERGY ALERT: ${patient.allergies}\n${"=".repeat(50)}\n`
    : "";

  // Patient info
  const patientInfo = [
    `# ${patient.name} — ${patient.species} (${patient.breed})`,
    allergyBanner,
    `**Sex:** ${patient.sex}`,
    `**Age:** ${age} (DOB: ${patient.date_of_birth})`,
    `**Weight:** ${patient.weight_lbs} lbs`,
    `**Status:** ${patient.status}`,
    patient.microchip_id ? `**Microchip:** ${patient.microchip_id}` : null,
    patient.notes ? `**Notes:** ${patient.notes}` : null,
    "",
    `**Owner:** ${patient.owner_name}`,
    `**Phone:** ${patient.owner_phone} | **Email:** ${patient.owner_email}`,
    patient.owner_address ? `**Address:** ${patient.owner_address}` : null,
  ].filter((line) => line !== null).join("\n");

  // Vaccination status
  const vaxSection = vaccinations.length > 0
    ? "\n\n## Vaccination Status\n" + vaccinations.map((v) => {
        const icon = v.status === "Overdue" ? "🔴" : v.status === "Due Soon" ? "🟡" : "🟢";
        return `${icon} **${v.vaccine_name}** — ${v.status} (due ${v.next_due_date}) | Last: ${v.date_administered} by ${v.administered_by}`;
      }).join("\n")
    : "\n\n## Vaccination Status\nNo vaccination records.";

  // Weight history
  const weightSection = weightHistory.length > 0
    ? "\n\n## Weight History\n" + weightHistory.map((w) =>
        `${w.appointment_datetime.split("T")[0]}: ${w.weight_lbs} lbs`
      ).join("\n")
    : "";

  // Recent treatments
  const treatmentSection = recentTreatments.length > 0
    ? "\n\n## Recent Treatments (last 10)\n" + recentTreatments.map((t) => {
        const meds = t.medications ? `\n  Meds: ${formatMeds(t.medications)}` : "";
        const diag = t.diagnosis ? `\n  Diagnosis: ${t.diagnosis}` : "";
        const paidStatus = t.paid ? "" : " [UNPAID]";
        return `**${t.date}** — ${t.description} ($${t.cost.toFixed(2)}${paidStatus}) — ${t.veterinarian}${diag}${meds}`;
      }).join("\n")
    : "\n\n## Recent Treatments\nNo treatment records.";

  // Upcoming appointments
  const apptSection = upcomingAppointments.length > 0
    ? "\n\n## Upcoming Appointments\n" + upcomingAppointments.map((a) => {
        const dt = a.appointment_datetime.replace("T", " at ");
        return `**${dt}** — ${a.type}: ${a.reason} (${a.veterinarian})`;
      }).join("\n")
    : "\n\n## Upcoming Appointments\nNone scheduled.";

  return {
    content: [{
      type: "text" as const,
      text: patientInfo + vaxSection + weightSection + treatmentSection + apptSection,
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

function formatMeds(medsJson: string): string {
  try {
    const meds = JSON.parse(medsJson) as { name: string; dose: string; frequency: string }[];
    return meds.map((m) => `${m.name} ${m.dose} ${m.frequency}`).join(", ");
  } catch {
    return medsJson;
  }
}
