import { searchCustomers } from "../database.js";

export interface LookupCustomerInput {
  query: string;
  plan?: string;
  status?: string;
}

export function handleLookupCustomer(input: LookupCustomerInput) {
  const results = searchCustomers(input.query, {
    plan: input.plan,
    status: input.status,
  });

  if (results.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No customers found matching "${input.query}"${input.plan ? ` on ${input.plan} plan` : ""}${input.status ? ` with status ${input.status}` : ""}.`,
        },
      ],
    };
  }

  const formatted = results
    .map(
      (c) =>
        `━━━ ${c.name} ━━━
ID: ${c.id}
Contact: ${c.contact_name} (${c.contact_email})
Plan: ${c.plan} | Seats: ${c.seats} | Billing: ${c.billing_cycle}
MRR: $${c.mrr.toLocaleString("en-US", { minimumFractionDigits: 2 })}
Status: ${c.status}
Signed Up: ${c.signup_date}
Next Renewal: ${c.next_renewal_date}`
    )
    .join("\n\n");

  return {
    content: [
      {
        type: "text" as const,
        text: `Found ${results.length} customer(s):\n\n${formatted}`,
      },
    ],
  };
}
