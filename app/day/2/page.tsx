import { CreditCard, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'lookup_customer', description: 'Search customers by name, email, or plan' },
  { name: 'get_billing_history', description: 'Full invoice + transaction history for any account' },
  { name: 'find_discrepancies', description: 'Surface duplicate charges, failed payments, anomalies' },
  { name: 'open_tickets', description: 'View tickets by status, category, or assigned rep' },
  { name: 'revenue_summary', description: 'MRR dashboard — totals, by plan, churn, failed payments' },
  { name: 'get_plan_changes', description: 'Track upgrades, downgrades, and seat changes with prorations' },
];

const exampleQueries = [
  'Did Greenfield Analytics get charged twice in January?',
  'Show me all failed payments this month',
  "What's the billing history for Brightpath Studios?",
  'Which customers have open refund requests?',
  "What's our current MRR breakdown by plan?",
  'Walk me through the proration on the Cascade Media downgrade',
];

export default function Day2Page() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-cream/90 backdrop-blur-md border-b border-sand/50 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono text-sm text-clay tracking-wider hover:text-terracotta transition-colors">
            30 DAYS OF CLAUDE CODE
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://tellavsn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-charcoal hover:text-terracotta transition-colors"
            >
              tellavsn.com
            </a>
            <a
              href="https://github.com/ashleynharrison/30-days-claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-charcoal hover:text-terracotta transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-clay hover:text-terracotta transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all days
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-terracotta/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">
                Day 2 &mdash; SaaS / FinOps
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">
                SaaS Billing Support
              </h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Stop alt-tabbing. Start asking.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that gives a billing support team instant access to customer accounts,
            invoices, transactions, and tickets through natural language. One question. One answer.
          </p>
        </div>
      </section>

      {/* Example Queries */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">
            Example Queries
          </p>
          <div className="grid gap-3">
            {exampleQueries.map((query) => (
              <div
                key={query}
                className="p-4 bg-linen border border-sand rounded-lg font-mono text-sm text-charcoal"
              >
                &ldquo;{query}&rdquo;
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">
            Tools
          </p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">6 MCP Tools</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-sand">
                  <th className="pb-3 font-mono text-xs text-clay tracking-wider uppercase">Tool</th>
                  <th className="pb-3 font-mono text-xs text-clay tracking-wider uppercase">What It Does</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr key={tool.name} className="border-b border-sand/50">
                    <td className="py-3 pr-6 font-mono text-sm text-terracotta whitespace-nowrap">
                      {tool.name}
                    </td>
                    <td className="py-3 text-sm text-charcoal">{tool.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why SaaS Billing */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">
            Why This Industry
          </p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why SaaS Billing?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              I spent four years in billing support at a SaaS company. I&apos;ve handled prorations,
              refunds, true-ups, failed payments, and every edge case in between &mdash; at high volume
              with a 95% CSAT rating.
            </p>
            <p>
              This tool solves the exact problem I lived every day: a customer writes in with a billing
              question, and the rep has to check three systems before they can even start typing a response.
            </p>
            <p className="font-medium text-ink">
              One question should be enough.
            </p>
          </div>
        </div>
      </section>

      {/* Data Overview */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">
            Demo Data
          </p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">What&apos;s Inside</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Customers', value: '30' },
              { label: 'Invoices', value: '160+' },
              { label: 'Transactions', value: '200+' },
              { label: 'Support Tickets', value: '40' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            Includes realistic edge cases: double charges, failed payment retries, mid-cycle
            prorations, churned accounts with open refunds, and enterprise true-ups.
          </p>
        </div>
      </section>

      {/* Setup */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">
            Setup
          </p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Try It Locally</h2>
          <div className="bg-ink rounded-lg p-6 overflow-x-auto">
            <pre className="font-mono text-sm text-cream leading-relaxed">
              <code>{`cd day02-saas-billing
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">
            Then add the config to Claude Desktop and restart.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">
            Want one of these for your business?
          </h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your support team is still alt-tabbing between tools, let&apos;s fix that.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:ashley@tellavsn.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta/90 transition-colors"
            >
              <Mail className="w-4 h-4" />
              ashley@tellavsn.com
            </a>
            <a
              href="https://tellavsn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-sand text-charcoal rounded-lg font-medium hover:border-terracotta hover:text-terracotta transition-colors"
            >
              tellavsn.com
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-charcoal font-medium">Tell a Vsn</p>
            <p className="text-xs text-clay">Talk to your business.</p>
          </div>
          <p className="text-xs text-clay">
            Day 2 of 30. Follow along.
          </p>
        </div>
      </footer>
    </div>
  );
}
