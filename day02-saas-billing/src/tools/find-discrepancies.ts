import { getCustomerByIdOrName, findDiscrepancies } from "../database.js";

export interface FindDiscrepanciesInput {
  customer: string;
}

export function handleFindDiscrepancies(input: FindDiscrepanciesInput) {
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

  const discrepancies = findDiscrepancies(customer.id);

  if (discrepancies.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `✅ No billing discrepancies found for ${customer.name}. Everything looks clean.`,
        },
      ],
    };
  }

  const formatted = discrepancies
    .map((d, i) => {
      let detailsStr = "";
      if (d.type === "Duplicate Charge") {
        const det = d.details as {
          amount: number;
          dates: string[];
          descriptions: string[];
          transaction_ids: number[];
        };
        detailsStr = `   Amount: $${det.amount.toFixed(2)}
   Dates: ${det.dates.join(" and ")}
   Transaction IDs: ${det.transaction_ids.join(", ")}
   Descriptions:
     • ${det.descriptions.join("\n     • ")}`;
      } else if (d.type === "Failed Payments") {
        const det = d.details as {
          count: number;
          payments: Array<{
            id: number;
            amount: number;
            date: string;
            description: string;
            payment_method: string;
          }>;
        };
        detailsStr = det.payments
          .map(
            (p) =>
              `   • ${p.date}: $${p.amount.toFixed(2)} via ${p.payment_method} — ${p.description}`
          )
          .join("\n");
      } else {
        detailsStr = `   ${JSON.stringify(d.details, null, 2)
          .split("\n")
          .join("\n   ")}`;
      }

      return `⚠️  ${i + 1}. ${d.type}
   ${d.description}
${detailsStr}`;
    })
    .join("\n\n");

  return {
    content: [
      {
        type: "text" as const,
        text: `━━━ Billing Discrepancies: ${customer.name} ━━━
Found ${discrepancies.length} issue(s):

${formatted}`,
      },
    ],
  };
}
