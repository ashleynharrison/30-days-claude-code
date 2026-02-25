import { getRevenueSummary } from "../database.js";

export function handleRevenueSummary() {
  const summary = getRevenueSummary();

  const mrrByPlan = Object.entries(summary.mrr_by_plan)
    .map(([plan, mrr]) => `  ${plan}: $${mrr.toLocaleString("en-US", { minimumFractionDigits: 2 })}`)
    .join("\n");

  const countByStatus = Object.entries(summary.customer_count_by_status)
    .map(([status, count]) => `  ${status}: ${count}`)
    .join("\n");

  return {
    content: [
      {
        type: "text" as const,
        text: `━━━ Revenue Summary ━━━

💰 Total MRR: $${summary.total_mrr.toLocaleString("en-US", { minimumFractionDigits: 2 })}

MRR by Plan:
${mrrByPlan}

Customers by Status:
${countByStatus}

⚠️  Failed Payments (this month): ${summary.failed_payments_this_month}
🔄 Pending Refund Requests: ${summary.pending_refunds}
📉 Churned Customers: ${summary.churn_count}`,
      },
    ],
  };
}
