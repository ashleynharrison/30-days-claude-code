import { HardHat, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'project_overview', description: 'Budget vs. spend, completion %, open RFIs, upcoming inspections, and change order totals' },
  { name: 'subcontractor_status', description: 'Track subs by trade, contract value, insurance expiry, and failed inspections' },
  { name: 'inspection_tracker', description: 'Scheduled, passed, failed, and conditional inspections with correction deadlines' },
  { name: 'rfi_status', description: 'Open and answered RFIs — priority, days open, responses, and impact areas' },
  { name: 'change_order_log', description: 'Amounts, reasons, schedule impact, approval status, and % of original contract' },
  { name: 'daily_log', description: 'Weather, crew counts, work performed, delays, safety incidents, and super notes' },
];

const exampleQueries = [
  'What\u2019s the status on the Meridian project?',
  'Which RFIs have been open for more than 2 weeks?',
  'Any failed inspections I need to follow up on?',
  'How much have we spent in change orders on Harbor View?',
  'Show me the daily logs from last week on the Westfield remodel',
  'Which subcontractors have insurance expiring soon?',
];

export default function Day7Page() {
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
              <HardHat className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 7 &mdash; Construction</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Construction Project Tracker</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Your job trailer just got smarter.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that connects project data, subcontractors, inspections, RFIs, change orders,
            and daily field logs to Claude. Ask about your jobs and get real answers &mdash; not another spreadsheet.
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

      {/* Why This Industry */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Why This Industry</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Construction?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Construction runs on paper, email threads, and the superintendent&apos;s memory. RFIs get buried
              in inboxes. Change orders get approved verbally and documented weeks later. Daily logs sit
              in a binder nobody reads.
            </p>
            <p>
              When a GC asks &ldquo;how much have we spent in change orders on this job?&rdquo; the answer
              shouldn&apos;t require opening four spreadsheets and a folder of PDFs.
            </p>
            <p className="font-medium text-ink">
              This tool gives the project manager answers, not more tabs to open.
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
              { label: 'Projects', value: '4' },
              { label: 'Subcontractors', value: '14' },
              { label: 'Inspections', value: '18' },
              { label: 'RFIs', value: '12' },
              { label: 'Change Orders', value: '8' },
              { label: 'Daily Logs', value: '23' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            Includes an $8.5M mixed-use development, a 12-unit townhome complex, a residential renovation
            with homeowners on-site, and a public community center on hold due to a permit dispute. Real
            edge cases: failed inspections with correction deadlines, conditional approvals, a critical RFI
            open 45 days, a change order under negotiation, and a sub with expiring insurance.
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
              <code>{`cd day07-construction
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Want one for your jobs?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your superintendent is still flipping through binders to find last week&apos;s inspection notes, let&apos;s fix that.
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
          <p className="text-xs text-clay">Day 7 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
