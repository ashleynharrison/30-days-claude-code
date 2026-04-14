import { Rocket, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'contact_lookup',     description: 'Deep view of a single contact — profile, open items, recent transactions, lifetime value, and activity log. Matches on name, email, phone, or id.' },
  { name: 'contact_upsert',     description: 'Create or update a contact in one call (matched by email). Writes to the activity log automatically.' },
  { name: 'items_list',         description: 'Filtered list of items with computed overdue / age flags. Filter by status, priority, category, assignee, or overdue-only.' },
  { name: 'item_create',        description: 'Create an item under a contact. Resolves the parent by name, email, or id so the LLM doesn\'t need to know database ids.' },
  { name: 'analytics_summary',  description: 'Business-wide rollup — active contacts, open / overdue items, revenue (completed vs pending), top contacts by LTV, activity volume.' },
  { name: 'activity_log',       description: 'Query the audit log. Filter by contact, action, or trailing window. Answers "what happened and who did it?"' },
];

const exampleQueries = [
  'What\'s on the business today? Give me the summary.',
  'Pull up everything on Maya Chen',
  'Which items are overdue?',
  'Add a new contact: Alex Kim at Helio, alex@helio.co',
  'Create a high-priority onboarding task for Jordan Reyes due Friday',
  'What happened in the last 14 days?',
];

export default function Day30Page() {
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
              <Rocket className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 30 &mdash; Custom Development + MCP</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">The MCP Starter Kit</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            30 days. 30 builds. 10 industries. 9 services.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            For the final day, an open-source starter kit. Every pattern from the previous 29 builds
            distilled into one clean skeleton &mdash; so you can ship your own MCP server in an afternoon.
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">6 MCP Tools — The Six Patterns</h2>
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

      {/* The Patterns */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">The Patterns</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Every MCP Needs These Six Things</h2>
          <p className="text-charcoal leading-relaxed mb-6">
            After 29 builds across law firms, vet clinics, real estate, fitness, construction, healthcare,
            and six more industries, the same six tool shapes kept showing up. That&apos;s what this kit is:
          </p>
          <div className="grid gap-4">
            {[
              { step: 'Lookup',    color: 'bg-blue-500',     desc: 'A "give me everything about X" deep-view tool. Fuzzy match on whatever identifier the user has — name, email, phone, id.' },
              { step: 'Upsert',    color: 'bg-emerald-500',  desc: 'Create-or-update in one call. Match on a natural key (email, slug). Always write to the audit log.' },
              { step: 'List',      color: 'bg-amber-500',    desc: 'Filtered list with computed flags (overdue, at-risk, stale). Return the rows plus aggregate counts in one payload.' },
              { step: 'Create',    color: 'bg-purple-500',   desc: 'Child records linked to a parent. Resolve the parent by any identifier so the LLM doesn\'t need to know ids.' },
              { step: 'Analytics', color: 'bg-rose-500',     desc: 'One tool that answers "what\'s happening in the business?" — counts, totals, top-N, trailing windows.' },
              { step: 'Audit',     color: 'bg-cyan-500',     desc: 'Query the activity log. Filter by actor, action, or window. This is the tool you didn\'t know you needed until you needed it.' },
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Because the Hard Part Isn&apos;t the MCP</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              After doing this thirty times, the pattern was obvious: the MCP wrapper is trivial.
              What takes time is deciding which six questions your team actually asks, modeling the
              data so those answers come out in one SQL block, and keeping computed fields
              (overdue, at-risk, age) out of the schema.
            </p>
            <p>
              This kit is the skeleton of those decisions. A parent entity. Two child tables.
              An audit log. Six tools. Rename &ldquo;contacts&rdquo; to whatever your business actually
              tracks and you have a working MCP server your team can query from Claude Desktop
              by end of day.
            </p>
            <p className="font-medium text-ink">
              Talk to your business. It&apos;s not that hard anymore.
            </p>
          </div>
        </div>
      </section>

      {/* Data Overview */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Demo Data</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">What&apos;s Inside</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Contacts',     value: '8' },
              { label: 'Items',        value: '9' },
              { label: 'Transactions', value: '10' },
              { label: 'Activity',     value: '9' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            Eight contacts across active, paused, and archived states. Items in every status
            including one overdue and one urgent. Transactions covering completed, pending, and a
            refund. An activity log with referrals, status changes, and priority bumps. Small
            enough to read, varied enough that every tool returns something interesting.
          </p>
        </div>
      </section>

      {/* Setup */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Setup</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Ship Your Own MCP Today</h2>
          <div className="bg-ink rounded-lg p-6 overflow-x-auto">
            <pre className="font-mono text-sm text-cream leading-relaxed">
              <code>{`git clone https://github.com/ashleynharrison/30-days-claude-code
cd 30-days-claude-code/day30-mcp-starter-kit
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">
            Then rename <span className="font-mono text-terracotta">contacts</span> to whatever your
            business actually tracks, replace the seed data, and you&apos;re running.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">30 builds down. Now yours.</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If you want one built specifically for your business &mdash; by someone who just shipped
            thirty of them &mdash; let&apos;s talk.
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
          <p className="text-xs text-clay">Day 30 of 30. That&apos;s a wrap.</p>
        </div>
      </footer>
    </div>
  );
}
