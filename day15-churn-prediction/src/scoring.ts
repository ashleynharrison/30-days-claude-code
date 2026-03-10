import db from './database.js';

interface UsageRow {
  week_start: string;
  logins: number;
  api_calls: number;
  features_used: number;
  active_users: number;
  session_minutes: number;
}

interface BillingRow {
  event_type: string;
  date: string;
  amount: number | null;
  details: string | null;
}

interface TicketRow {
  category: string;
  priority: string;
  status: string;
  satisfaction_score: number | null;
  created_at: string;
}

interface CustomerRow {
  id: number;
  last_login: string | null;
  signup_date: string;
  plan: string;
  mrr: number;
  status: string;
}

export interface ChurnScore {
  customerId: number;
  score: number;
  riskLevel: string;
  usageSignal: number;
  billingSignal: number;
  supportSignal: number;
  engagementSignal: number;
  topFactors: string[];
}

/**
 * Compute churn risk score for a customer.
 * Score 0-100 where higher = more likely to churn.
 *
 * Signals:
 * - Usage: declining logins, API calls, features, active users (0-30 pts)
 * - Billing: failed payments, downgrades, cancellation requests (0-25 pts)
 * - Support: high ticket volume, low satisfaction, escalations (0-25 pts)
 * - Engagement: days since last login, account age (0-20 pts)
 */
export function computeChurnScore(customerId: number): ChurnScore {
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId) as CustomerRow | undefined;
  if (!customer) throw new Error(`Customer ${customerId} not found`);

  const factors: string[] = [];

  // --- Usage Signal (0-30) ---
  const usage = db.prepare(
    'SELECT * FROM usage_metrics WHERE customer_id = ? ORDER BY week_start ASC'
  ).all(customerId) as UsageRow[];

  let usageSignal = 0;
  if (usage.length >= 4) {
    const firstHalf = usage.slice(0, Math.floor(usage.length / 2));
    const secondHalf = usage.slice(Math.floor(usage.length / 2));

    const avgFirst = avg(firstHalf.map(u => u.logins));
    const avgSecond = avg(secondHalf.map(u => u.logins));

    if (avgFirst > 0) {
      const loginDecline = (avgFirst - avgSecond) / avgFirst;
      if (loginDecline > 0.5) { usageSignal += 15; factors.push('Login activity dropped >50%'); }
      else if (loginDecline > 0.25) { usageSignal += 8; factors.push('Login activity declining'); }
    }

    const apiFirst = avg(firstHalf.map(u => u.api_calls));
    const apiSecond = avg(secondHalf.map(u => u.api_calls));
    if (apiFirst > 0) {
      const apiDecline = (apiFirst - apiSecond) / apiFirst;
      if (apiDecline > 0.5) { usageSignal += 10; factors.push('API usage dropped significantly'); }
      else if (apiDecline > 0.25) { usageSignal += 5; factors.push('API usage declining'); }
    }

    const recentFeatures = secondHalf[secondHalf.length - 1]?.features_used ?? 0;
    if (recentFeatures <= 2) { usageSignal += 5; factors.push('Using very few features'); }
  } else if (usage.length === 0 && customer.status === 'active') {
    usageSignal = 10;
    factors.push('No usage data available');
  }

  // --- Billing Signal (0-25) ---
  const billing = db.prepare(
    'SELECT * FROM billing_events WHERE customer_id = ? ORDER BY date DESC'
  ).all(customerId) as BillingRow[];

  let billingSignal = 0;
  const failedPayments = billing.filter(b => b.event_type === 'failed_payment').length;
  if (failedPayments >= 2) { billingSignal += 10; factors.push(`${failedPayments} failed payments`); }
  else if (failedPayments === 1) { billingSignal += 4; factors.push('Recent failed payment'); }

  if (billing.some(b => b.event_type === 'downgrade')) {
    billingSignal += 8; factors.push('Downgraded plan');
  }
  if (billing.some(b => b.event_type === 'cancellation_request')) {
    billingSignal += 10; factors.push('Requested cancellation');
  }
  if (billing.some(b => b.event_type === 'cancellation')) {
    billingSignal += 25; factors.push('Already cancelled');
  }
  if (billing.some(b => b.event_type === 'discount_request')) {
    billingSignal += 5; factors.push('Asked for discount');
  }

  // --- Support Signal (0-25) ---
  const tickets = db.prepare(
    'SELECT * FROM support_tickets WHERE customer_id = ? ORDER BY created_at DESC'
  ).all(customerId) as TicketRow[];

  let supportSignal = 0;
  const recentTickets = tickets.filter(t => t.created_at >= '2026-01-01').length;
  if (recentTickets >= 4) { supportSignal += 8; factors.push(`${recentTickets} support tickets in last 2 months`); }
  else if (recentTickets >= 2) { supportSignal += 3; }

  const escalations = tickets.filter(t => t.category === 'escalation').length;
  if (escalations > 0) { supportSignal += 8; factors.push(`${escalations} escalation(s)`); }

  const satScores = tickets.map(t => t.satisfaction_score).filter((s): s is number => s !== null);
  if (satScores.length > 0) {
    const avgSat = avg(satScores);
    if (avgSat <= 2) { supportSignal += 9; factors.push(`Low satisfaction (avg ${avgSat.toFixed(1)}/5)`); }
    else if (avgSat <= 3) { supportSignal += 4; factors.push(`Below-average satisfaction (${avgSat.toFixed(1)}/5)`); }
  }

  const openTickets = tickets.filter(t => t.status === 'open').length;
  if (openTickets >= 2) { supportSignal += 4; factors.push(`${openTickets} unresolved tickets`); }

  // --- Engagement Signal (0-20) ---
  let engagementSignal = 0;
  if (customer.last_login) {
    const daysSinceLogin = Math.floor(
      (Date.now() - new Date(customer.last_login).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLogin > 30) { engagementSignal += 12; factors.push(`No login in ${daysSinceLogin} days`); }
    else if (daysSinceLogin > 14) { engagementSignal += 6; factors.push(`Last login ${daysSinceLogin} days ago`); }
  } else {
    engagementSignal += 10;
    factors.push('Never logged in');
  }

  const accountAgeDays = Math.floor(
    (Date.now() - new Date(customer.signup_date).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (accountAgeDays < 90) {
    engagementSignal += 5;
    factors.push('New account (<90 days)');
  }

  // --- Final Score ---
  const rawScore = Math.min(100,
    usageSignal + billingSignal + supportSignal + engagementSignal
  );

  // Churned accounts get 100
  const score = customer.status === 'churned' ? 100 : rawScore;

  let riskLevel: string;
  if (score >= 70) riskLevel = 'critical';
  else if (score >= 45) riskLevel = 'high';
  else if (score >= 25) riskLevel = 'medium';
  else riskLevel = 'low';

  return {
    customerId,
    score,
    riskLevel,
    usageSignal: Math.min(30, usageSignal),
    billingSignal: Math.min(25, billingSignal),
    supportSignal: Math.min(25, supportSignal),
    engagementSignal: Math.min(20, engagementSignal),
    topFactors: factors.slice(0, 5),
  };
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
