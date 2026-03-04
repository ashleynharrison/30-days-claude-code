import { UserCheck, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'client_search', description: 'Search clients at any intake stage — prospects, in-progress, onboarded, declined, or withdrawn' },
  { name: 'intake_review', description: 'Review intake forms with full data, flags, and approval status. Surface forms needing attention' },
  { name: 'conflict_checker', description: 'Run conflict of interest checks — pending, found, confirmed. Critical for ethics compliance' },
  { name: 'engagement_tracker', description: 'Track engagement letters — drafts, sent, signed. Fee structures, retainers, and expiration dates' },
  { name: 'workflow_status', description: 'Intake workflow progress per client — completed, in-progress, blocked, overdue steps with progress bars' },
  { name: 'document_tracker', description: 'Track collected documents — uploaded files, review status, and flags for each client' },
];

const exampleQueries = [
  'Which clients are stuck in intake right now?',
  'Are there any conflict of interest issues I need to resolve?',
  'Show me engagement letters that are still waiting for a signature',
  'What intake forms have been submitted but not reviewed?',
  'What documents are flagged for Thomas Brennan\u2019s real estate deal?',
  'Which workflow steps are overdue across all clients?',
];

export default function Day10Page() {
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
              <UserCheck className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 10 &mdash; AI Engineering / Legal &amp; Consulting</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Client Intake Automation</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Every consulting firm has the same problem: onboarding takes 3 meetings when it should take 1.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that manages the entire client intake pipeline &mdash; from first contact
            through conflict checks, engagement letters, document collection, and kickoff.
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
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Why This Build</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Client Intake?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Client intake at law firms and consulting agencies is a mess of email threads, shared drives,
              and &ldquo;did anyone run the conflict check?&rdquo; conversations. A single missed step can
              mean ethical violations, malpractice exposure, or simply a terrible first impression.
            </p>
            <p>
              Most firms use a spreadsheet or a half-implemented CRM. The intake coordinator keeps the real
              process in their head. When they&apos;re out sick, everything stalls.
            </p>
            <p className="font-medium text-ink">
              This tool makes the invisible workflow visible. Every client has a clear pipeline from prospect to
              onboarded, with conflict checks that actually get flagged and engagement letters that don&apos;t
              expire in a drawer.
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
              { label: 'Clients', value: '12' },
              { label: 'Intake Forms', value: '8' },
              { label: 'Conflict Checks', value: '8' },
              { label: 'Engagements', value: '6' },
              { label: 'Workflow Steps', value: '40' },
              { label: 'Documents', value: '15' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            12 clients across 7 practice areas at different stages: 3 fully onboarded, 4 in-progress
            (including one blocked by a conflict), 3 new prospects, and 2 declined/withdrawn. Includes
            a real conflict of interest scenario, an engagement letter approaching expiration, flagged
            environmental documents, and overdue workflow steps.
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
              <code>{`cd day10-client-intake
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Still onboarding clients with email threads?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your intake process lives in someone&apos;s head instead of a system, let&apos;s fix that.
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
          <p className="text-xs text-clay">Day 10 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
