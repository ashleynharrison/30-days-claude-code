import { Activity, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'site_lookup', description: 'Search monitored sites by name, category, or owner. Returns latest Core Web Vitals scores and overall health status.' },
  { name: 'vitals_snapshot', description: 'Get the latest Core Web Vitals snapshot for a site — LCP, CLS, INP, FCP, TTFB — with pass/fail status against Google thresholds.' },
  { name: 'trend_analysis', description: 'Analyze Core Web Vitals trends over time. Weekly snapshots showing direction of change and whether metrics are improving or regressing.' },
  { name: 'budget_check', description: 'Check performance budgets across all monitored sites. Shows which sites are passing, warning, or failing their thresholds.' },
  { name: 'optimization_hitlist', description: 'Get prioritized optimization recommendations ranked by impact and effort. Includes estimated performance savings in milliseconds.' },
  { name: 'resource_audit', description: 'Audit page resources — images, scripts, stylesheets, fonts — with sizes, load times, and whether they block rendering.' },
];

const exampleQueries = [
  'Which sites are failing their Core Web Vitals?',
  'Show me the LCP trend for Acme Store over the last 8 weeks',
  'What are the top optimization opportunities ranked by impact?',
  'Which resources on the store are render-blocking?',
  'How big is the hero image on the homepage?',
  'Is the dashboard INP getting better or worse?',
];

export default function Day19Page() {
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
              <Activity className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 19 &mdash; Performance Optimization</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Core Web Vitals Monitor</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Track LCP, CLS, and INP across every site you manage &mdash; with trends, budgets, alerts, and a prioritized hit list of what to fix first.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that turns performance monitoring into a conversation. Ask which sites are failing, where metrics are regressing,
            and what optimizations would have the biggest impact. No more squinting at Lighthouse reports.
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
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Monitored Sites</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">6 Sites Tracked</h2>
          <div className="grid gap-4">
            {[
              { name: 'Acme Store', category: 'E-Commerce', lcp: '2800ms', cls: '0.07', inp: '195ms', status: 'warning' },
              { name: 'Acme Blog', category: 'Content', lcp: '1370ms', cls: '0.01', inp: '84ms', status: 'passing' },
              { name: 'Acme Dashboard', category: 'SaaS App', lcp: '1790ms', cls: '0.03', inp: '370ms', status: 'failing' },
              { name: 'Acme Marketing', category: 'Marketing', lcp: '1840ms', cls: '0.13', inp: '138ms', status: 'warning' },
              { name: 'Acme Docs', category: 'Documentation', lcp: '885ms', cls: '0.01', inp: '56ms', status: 'passing' },
              { name: 'Acme Careers', category: 'Careers', lcp: '2450ms', cls: '0.03', inp: '122ms', status: 'passing' },
            ].map((site) => (
              <div key={site.name} className="p-6 bg-white border border-sand rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink">{site.name}</h3>
                    <p className="text-sm text-clay">{site.category}</p>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded-full ${
                    site.status === 'failing' ? 'bg-red-100 text-red-700' :
                    site.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {site.status}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="font-mono text-sm font-bold text-ink">{site.lcp}</span>
                    <span className="text-xs text-clay ml-1">LCP</span>
                  </div>
                  <div>
                    <span className="font-mono text-sm font-bold text-terracotta">{site.cls}</span>
                    <span className="text-xs text-clay ml-1">CLS</span>
                  </div>
                  <div>
                    <span className="font-mono text-sm font-bold text-ink">{site.inp}</span>
                    <span className="text-xs text-clay ml-1">INP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Build */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Why This Build</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Core Web Vitals?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Google uses Core Web Vitals as a ranking signal. Your hero image is 4.2MB and your CTO is wondering
              why bounce rate is 60%. The data is there &mdash; buried in Lighthouse reports nobody reads.
            </p>
            <p>
              Most teams run a Lighthouse audit before launch, get a green score, and never look again. Then someone
              adds an unoptimized image, a third-party script starts blocking render, and performance degrades
              quietly until someone notices the SEO drop.
            </p>
            <p className="font-medium text-ink">
              This server tracks six sites across eight weeks of measurements, with performance budgets, automated alerts,
              a prioritized optimization hit list, and full resource audits. Ask a question about your site&apos;s
              performance and get an answer backed by real data &mdash; not a vague Lighthouse score.
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
              { label: 'Sites Monitored', value: '6' },
              { label: 'Measurements', value: '96' },
              { label: 'Performance Budgets', value: '18' },
              { label: 'Recommendations', value: '15' },
              { label: 'Alerts', value: '8' },
              { label: 'Resources Tracked', value: '25' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            Six sites spanning e-commerce, content, SaaS, marketing, docs, and careers. Eight weeks of weekly Core Web Vitals
            measurements on both mobile and desktop. Performance budgets with Google&apos;s official thresholds. Realistic
            regressions (hero image bloat, heavy JS bundles, ad-slot layout shifts) and a prioritized optimization hit list
            with estimated savings.
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
              <code>{`cd day19-core-web-vitals
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Need a performance monitoring setup that actually gets used?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your Lighthouse scores are gathering dust and your Core Web Vitals are a mystery, let&apos;s talk about making performance data conversational.
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
          <p className="text-xs text-clay">Day 19 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
