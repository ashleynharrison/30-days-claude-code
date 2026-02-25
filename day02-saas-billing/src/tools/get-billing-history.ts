import { getCustomerByIdOrName, getBillingHistory } from "../database.js";

export interface GetBillingHistoryInput {
  customer: string;
  months_back?: number;
}

export function handleGetBillingHistory(input: GetBillingHistoryInput) {
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

  const months = input.months_back ?? 3;
  const history = getBillingHistory(customer.id, months);

  if (history.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No billing history found for ${customer.name} in the last ${months} month(s).`,
        },
      ],
    };
  }

  const formatted = history
    .map((entry) => {
      if (entry.entry_type === "invoice") {
        let lineItemsStr = "";
        if (entry.line_items) {
          try {
            const items = JSON.parse(entry.line_items) as Array<{
              description: string;
              amount: number;
            }>;
            lineItemsStr = items
              .map((i) => `    • ${i.description}: $${i.amount.toFixed(2)}`)
              .join("\n");
          } catch {
            lineItemsStr = `    • ${entry.line_items}`;
          }
        }
        return `📄 INVOICE ${entry.invoice_number} — ${entry.date}
   Amount: $${entry.amount.toFixed(2)} | Status: ${entry.invoice_status}
${lineItemsStr}`;
      } else {
        return `💳 ${entry.type?.toUpperCase()} — ${entry.date}
   $${entry.amount.toFixed(2)} | ${entry.transaction_status}
   ${entry.description}
   Payment: ${entry.payment_method}`;
      }
    })
    .join("\n\n");

  return {
    content: [
      {
        type: "text" as const,
        text: `━━━ Billing History: ${customer.name} (last ${months} months) ━━━
Plan: ${customer.plan} | Seats: ${customer.seats} | MRR: $${customer.mrr.toFixed(2)}

${formatted}`,
      },
    ],
  };
}
