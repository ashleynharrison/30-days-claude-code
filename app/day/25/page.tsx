import { Server, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'cost_breakdown', description: 'Breakdown of cloud costs by provider, category, or date range — total spend, daily averages, and per-service totals.' },
  { name: 'service_costs', description: 'Drill into a specific service — daily cost history, usage metrics, trends, and month-over-month changes.' },
  { name: 'budget_status', description: 'Budget status across all providers — actual vs. budget, burn rate, projected overage, and month-over-month comparison.' },
  { name: 'anomaly_detection', description: 'Detected cost anomalies — spikes, unusual patterns, and unresolved issues with severity and root cause notes.' },
  { name: 'cost_forecast', description: 'Cost forecasts for the next 1–3 months — predicted spend per provider with confidence intervals and budget comparison.' },
  { name: 'provider_comparison', description: 'Compare cloud providers side by side — total spend, cost per category, budget utilization, anomaly count, and trends.' },
];

const exampleQueries = [
  'Why is our AWS bill $4,200 this month?',
  'Which services are trending up the fastest?',
  'Are we going to go over budget on GCP this month?',
  'Show me all unresolved cost anomalies',
  'What does our cloud spend look like for the next 3 months?',
  'Compare all our providers — who costs the most and why?',
];

export default function Day25Page() {
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
              <Server className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 25 &mdash; DevOps</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Infrastructure Cost Tracker</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            &ldquo;Why is our AWS bill $4,200 this month?&rdquo; is a question that ruins mornings.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that tracks cloud spend across providers, flags anomalies, forecasts next month,
            and tells you exactly where the money is going. No more spreadsheet archaeology.
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

      {/* How It Works */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">The Pipeline</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">How Cost Tracking Works</h2>
          <p className="text-charcoal leading-relaxed mb-6">
            Every dollar is tracked across providers, services, and categories — then analyzed for patterns and problems:
          </p>
          <div className="grid gap-4">
            {[
              { step: 'Collect', color: 'bg-blue-500', desc: 'Daily cost records from every service across AWS, GCP, Azure, and Vercel — with usage quantities and units for context.' },
              { step: 'Analyze', color: 'bg-emerald-500', desc: 'Break down spend by provider, service, and category. Spot which services are trending up and which are stable.' },
              { step: 'Alert', color: 'bg-red-500', desc: 'Detect cost anomalies automatically — spikes from misconfigured auto-scaling, runaway queries, or unexpected API volume.' },
              { step: 'Forecast', color: 'bg-amber-500', desc: 'Project next month\'s bill with confidence intervals. Know if you\'re headed over budget before it happens.' },
            ].map((s) => (
              <div key={s.step} className="p-5 bg-white border border-sand rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-2 h-2 rounded-full ${s.color}`} />
                  <h3 className="font-serif text-lg font-bold text-ink">{s.step}</h3>
                </div>
                <p className="text-sm text-charcoal">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Build */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Why This Build</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Infrastructure Cost Tracking?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Cloud costs are the new electricity bill &mdash; everybody has one, nobody knows exactly what&apos;s in it,
              and it keeps going up. AWS, GCP, and Azure billing dashboards are powerful but siloed. Nobody has time
              to check three different consoles every morning.
            </p>
            <p>
              The real problem isn&apos;t the total number &mdash; it&apos;s the surprises. An unpartitioned BigQuery scan
              that costs $112 instead of $40. An ECS deploy that doubled your task count because of a health check bug.
              A new AI feature that tripled your API calls overnight.
            </p>
            <p className="font-medium text-ink">
              This tool catches those surprises before they compound. Ask one question, get a cross-provider view
              of where the money is going, what&apos;s abnormal, and what next month looks like. Second DevOps build
              of the challenge.
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
              { label: 'Providers', value: '4' },
              { label: 'Services', value: '21' },
              { label: 'Cost Records', value: '1,890' },
              { label: 'Budget Entries', value: '12' },
              { label: 'Anomalies', value: '7' },
              { label: 'Days of Data', value: '90' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            4 providers (AWS, GCP, Azure, Vercel) with 21 services across compute, database, storage, network,
            analytics, AI, and messaging categories. 90 days of daily cost records with realistic trends &mdash;
            some services stable, others trending up. 7 anomalies including a $112 BigQuery scan, a recursive
            Lambda, and a doubled ECS deployment. Forecasts for the next 3 months with confidence intervals.
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
              <code>{`cd day25-infrastructure-cost
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Want to stop guessing what your cloud bill will be?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If you&apos;re checking three billing dashboards every morning instead of asking one question, let&apos;s fix that.
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
          <p className="text-xs text-clay">Day 25 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
