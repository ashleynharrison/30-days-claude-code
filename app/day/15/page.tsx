import { TrendingDown, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'customer_overview', description: 'Search customers by name, company, plan, status, or industry. Returns profile info with current churn risk score.' },
  { name: 'churn_risk_score', description: 'Detailed churn risk breakdown for a customer — usage, billing, support, and engagement signal scores with contributing factors.' },
  { name: 'at_risk_cohort', description: 'List all customers sorted by churn risk. Filter by risk level or minimum score. Shows revenue at risk.' },
  { name: 'usage_trends', description: 'Weekly usage patterns — logins, API calls, features used, active users, session time. Shows trend direction.' },
  { name: 'intervention_recommendations', description: 'Recommended actions for at-risk customers based on their churn risk factors. Prioritized by impact with assigned owners.' },
  { name: 'pipeline_summary', description: 'Executive dashboard — risk distribution, revenue at risk, average scores by plan, and recent churn.' },
];

const exampleQueries = [
  'Which customers are most likely to churn this month?',
  'Show me the churn risk breakdown for Coastal Dev',
  'What\u2019s our total MRR at risk right now?',
  'How has Meridian Group\u2019s usage changed over the last 8 weeks?',
  'What should we do to save Blue Ridge Law?',
  'Give me the executive churn pipeline summary',
];

export default function Day15Page() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-cream/90 backdrop-blur-md border-b border-sand/50 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono text-sm text-clay tracking-wider hover:text-terracotta transition-colors">
            30 DAYS OF CLAUDE CODE
          </Link>
          <div className="flex items-center gap-4">
            <a href="https://tellavsn.com" target="_blank" rel="noopener noreferrer" className="text-sm text-charcoal hover:text-terracotta transition-colors">
              tellavsn.com
            </a>
            <a href="https://github.com/ashleynharrison/30-days-claude-code" target="_blank" rel="noopener noreferrer" className="text-charcoal hover:text-terracotta transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-clay hover:text-terracotta transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to all days
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-terracotta/10 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 15 &mdash; ML Engineering</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Churn Prediction Pipeline</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Your best customers don&apos;t leave without warning. You&apos;re just not listening.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An ML-powered MCP server that computes churn risk scores from usage patterns, billing signals, and support history.
            It doesn&apos;t just tell you who&apos;s at risk &mdash; it tells you why and what to do about it.
          </p>
        </div>
      </section>

      {/* Example Queries */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Example Queries</p>
          <div className="grid gap-3">
            {exampleQueries.map((query) => (
              <div key={query} className="p-4 bg-linen border border-sand rounded-lg font-mono text-sm text-charcoal">
                &ldquo;{query}&rdquo;
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Tools</p>
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
                    <td className="py-3 pr-6 font-mono text-sm text-terracotta whitespace-nowrap">{tool.name}</td>
                    <td className="py-3 text-sm text-charcoal">{tool.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How Scoring Works */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">The Model</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">How Churn Scoring Works</h2>
          <p className="text-charcoal leading-relaxed mb-6">
            Each customer gets a 0&ndash;100 churn risk score computed from four weighted signal categories:
          </p>
          <div className="grid gap-4">
            {[
              { signal: 'Usage', max: 30, color: 'bg-blue-500', desc: 'Login decline, API usage drop, low feature adoption' },
              { signal: 'Billing', max: 25, color: 'bg-amber-500', desc: 'Failed payments, downgrades, cancellation requests, discount asks' },
              { signal: 'Support', max: 25, color: 'bg-red-500', desc: 'Ticket volume, low satisfaction scores, escalations, open issues' },
              { signal: 'Engagement', max: 20, color: 'bg-purple-500', desc: 'Days since last login, account age, activity recency' },
            ].map((s) => (
              <div key={s.signal} className="p-5 bg-white border border-sand rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-lg font-bold text-ink">{s.signal} Signal</h3>
                  <span className="font-mono text-sm text-clay">0&ndash;{s.max} pts</span>
                </div>
                <div className="w-full bg-sand/50 rounded-full h-2 mb-3">
                  <div className={`h-2 rounded-full ${s.color}`} style={{ width: `${(s.max / 100) * 100}%` }} />
                </div>
                <p className="text-sm text-charcoal">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-white border border-sand rounded-lg">
            <p className="font-mono text-sm text-charcoal">
              <span className="text-green-600 font-bold">0&ndash;24 Low</span> &bull;{' '}
              <span className="text-yellow-600 font-bold">25&ndash;44 Medium</span> &bull;{' '}
              <span className="text-orange-600 font-bold">45&ndash;69 High</span> &bull;{' '}
              <span className="text-red-600 font-bold">70&ndash;100 Critical</span>
            </p>
          </div>
        </div>
      </section>

      {/* Why This Build */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Why This Build</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Churn Prediction?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Churn is the silent killer of SaaS companies. By the time a customer asks to cancel,
              the relationship has been deteriorating for weeks or months. The signals were there &mdash;
              declining logins, failed payments, frustrated support tickets &mdash; but nobody connected the dots.
            </p>
            <p>
              Most companies track these metrics in separate dashboards. Usage in one tool, billing in another,
              support in a third. The insight lives in the intersection, but nobody has time to cross-reference
              three systems for every customer.
            </p>
            <p className="font-medium text-ink">
              This pipeline does the cross-referencing automatically. It scores every customer across four signal
              categories, ranks them by risk, and recommends specific interventions with assigned owners. Ask
              &ldquo;who&apos;s about to churn?&rdquo; and get an answer with revenue impact &mdash; not a Jira ticket
              to investigate later. First ML Engineering build of the challenge.
            </p>
          </div>
        </div>
      </section>

      {/* Data Overview */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Demo Data</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">What&apos;s Inside</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Customers', value: '15' },
              { label: 'Usage Snapshots', value: '108' },
              { label: 'Billing Events', value: '25' },
              { label: 'Support Tickets', value: '21' },
              { label: 'Risk Profiles', value: '5' },
              { label: 'Weeks of Data', value: '8' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            15 SaaS customers across starter, pro, and enterprise plans with 8 weeks of usage snapshots.
            Includes healthy accounts, declining users, billing risk, support-heavy accounts, critical churn
            candidates, and two recently churned customers for comparison. Edge cases: cliff-drop usage,
            serial payment failures, and a customer who already requested cancellation.
          </p>
        </div>
      </section>

      {/* Setup */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Setup</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Try It Locally</h2>
          <div className="bg-ink rounded-lg p-6 overflow-x-auto">
            <pre className="font-mono text-sm text-cream leading-relaxed">
              <code>{`cd day15-churn-prediction
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Want to predict churn before it happens?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your customer success team is firefighting cancellations instead of preventing them, let&apos;s build something smarter.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="mailto:ashley@tellavsn.com" className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta/90 transition-colors">
              <Mail className="w-4 h-4" />
              ashley@tellavsn.com
            </a>
            <a href="https://tellavsn.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 border border-sand text-charcoal rounded-lg font-medium hover:border-terracotta hover:text-terracotta transition-colors">
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
          <p className="text-xs text-clay">Day 15 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
