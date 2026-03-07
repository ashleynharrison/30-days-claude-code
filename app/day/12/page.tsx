import { Gauge, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'site_overview', description: 'Overview of all monitored sites with latest scores, health grades, budget status, and open task counts' },
  { name: 'audit_results', description: 'Detailed Lighthouse audit results — category scores, Core Web Vitals with pass/fail grades, and page weight metrics' },
  { name: 'findings_report', description: 'Optimization findings and recommendations filtered by category, severity, or potential savings' },
  { name: 'budget_tracker', description: 'Performance budget tracking — see which metrics are within budget, over budget, or at risk across all sites' },
  { name: 'trend_analysis', description: 'Weekly score trends and Core Web Vital progression over time with direction analysis' },
  { name: 'task_manager', description: 'Manage optimization tasks — filter by priority, category, or status with estimated impact for each fix' },
];

const exampleQueries = [
  'Show me all sites and their current health status',
  'What are the latest Lighthouse scores for ShopVibe?',
  'What critical performance findings need fixing on ShopVibe?',
  'Which sites are over their performance budgets?',
  'Show me the performance trend for Meridian Health Portal over the last 6 weeks',
  'What are all the critical priority tasks across all sites?',
];

export default function Day12Page() {
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
              <Gauge className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 12 &mdash; Web Performance / DevOps</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Lighthouse Audit Dashboard</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Point it at your sites. Get performance scores, Core Web Vitals, optimization findings, and trend analysis &mdash; all queryable through natural language.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that tracks Lighthouse audit data across multiple sites. Monitor scores over time,
            catch budget violations, and manage optimization tasks with estimated impact.
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

      {/* Site Previews */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Demo Sites</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">6 Monitored Sites</h2>
          <div className="grid gap-4">
            {[
              { name: 'ShopVibe', category: 'E-Commerce', perf: 38, a11y: 76, health: 'poor', issues: '5 budgets over' },
              { name: 'Vantage Advisory', category: 'Financial Services', perf: 58, a11y: 86, health: 'needs-work', issues: '3 budgets over' },
              { name: 'Cascade Digital Agency', category: 'Agency Website', perf: 71, a11y: 92, health: 'good', issues: '2 budgets over' },
              { name: 'Meridian Health Portal', category: 'Healthcare Portal', perf: 72, a11y: 68, health: 'good', issues: 'Accessibility gaps' },
              { name: 'Kindred Kitchen', category: 'Restaurant', perf: 88, a11y: 94, health: 'good', issues: 'SEO under target' },
              { name: 'Forge Labs Docs', category: 'Documentation', perf: 97, a11y: 100, health: 'excellent', issues: 'None' },
            ].map((site) => (
              <div key={site.name} className="p-6 bg-white border border-sand rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink">{site.name}</h3>
                    <p className="text-sm text-clay">{site.category}</p>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded-full ${
                    site.health === 'excellent' ? 'bg-green-100 text-green-700' :
                    site.health === 'good' ? 'bg-blue-100 text-blue-700' :
                    site.health === 'needs-work' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {site.health}
                  </span>
                </div>
                <div className="flex items-center gap-6 mb-2">
                  <div>
                    <span className="font-mono text-2xl font-bold text-ink">{site.perf}</span>
                    <span className="text-xs text-clay ml-1">perf</span>
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold text-ink">{site.a11y}</span>
                    <span className="text-xs text-clay ml-1">a11y</span>
                  </div>
                </div>
                <p className="text-sm text-charcoal">{site.issues}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Build */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Why This Build</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Lighthouse Dashboards?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Most teams run Lighthouse once, screenshot the scores, and forget about it. The scores drop, nobody
              notices until a client complains or Google starts penalizing them.
            </p>
            <p>
              A queryable audit dashboard changes the workflow. Instead of manually re-running audits, you ask
              &ldquo;which sites are over budget?&rdquo; or &ldquo;what&apos;s the performance trend for the last 6 weeks?&rdquo;
              The data drives action instead of collecting dust.
            </p>
            <p className="font-medium text-ink">
              This is the first DevOps/Web Performance build in the challenge. It bridges the gap between running
              audits and actually fixing what they find &mdash; with tasks, priorities, and estimated impact.
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
              { label: 'Sites', value: '6' },
              { label: 'Audits', value: '18' },
              { label: 'Findings', value: '22' },
              { label: 'Budgets', value: '18' },
              { label: 'Trend Snapshots', value: '27' },
              { label: 'Tasks', value: '16' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            6 sites across e-commerce, healthcare, financial services, agencies, restaurants, and documentation.
            Each has 3 audit runs showing performance progression, Core Web Vital metrics, optimization findings
            with estimated savings, performance budgets, weekly trend data, and prioritized optimization tasks.
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
              <code>{`cd day12-lighthouse-dashboard
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Need a performance dashboard that drives action?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your Lighthouse scores are a mystery and your Core Web Vitals are slipping, let&apos;s fix that.
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
          <p className="text-xs text-clay">Day 12 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
