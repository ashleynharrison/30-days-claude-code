import { getCustomerByIdOrName, getPlanChanges } from "../database.js";

export interface GetPlanChangesInput {
  customer?: string;
  days_back?: number;
}

export function handleGetPlanChanges(input: GetPlanChangesInput) {
  let customerId: number | undefined;

  if (input.customer) {
    const customer = getCustomerByIdOrName(input.customer);
    if (!customer) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No customer found matching "${input.customer}".`,
          },
        ],
      };
    }
    customerId = customer.id;
  }

  const daysBack = input.days_back ?? 30;
  const changes = getPlanChanges(customerId, daysBack);

  if (changes.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No plan changes found${input.customer ? ` for "${input.customer}"` : ""} in the last ${daysBack} days.`,
        },
      ],
    };
  }

  const formatted = changes
    .map((pc) => {
      const prorationStr =
        pc.proration_amount !== null
          ? pc.proration_amount >= 0
            ? `Proration Charge: +$${pc.proration_amount.toFixed(2)}`
            : `Proration Credit: -$${Math.abs(pc.proration_amount).toFixed(2)}`
          : "No proration";

      return `━━━ ${pc.customer_name} — ${pc.change_type} ━━━
Date: ${pc.effective_date}
${pc.previous_plan} (${pc.previous_seats} seats) → ${pc.new_plan} (${pc.new_seats} seats)
${prorationStr}`;
    })
    .join("\n\n");

  return {
    content: [
      {
        type: "text" as const,
        text: `Found ${changes.length} plan change(s) in the last ${daysBack} days:\n\n${formatted}`,
      },
    ],
  };
}
