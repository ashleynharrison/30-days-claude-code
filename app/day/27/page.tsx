import { MessageSquareText, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'search_meetings', description: 'Search past meetings by keyword, type, date range, or participant — returns summaries, attendees, and action item counts.' },
  { name: 'meeting_summary', description: 'Full summary of a specific meeting — attendees, notes, decisions, and action items in one view.' },
  { name: 'action_items', description: 'List and filter action items across all meetings — by status, owner, priority, or due date. Find overdue items instantly.' },
  { name: 'decision_log', description: 'Browse decisions across all meetings — search by keyword, filter by impact level, and see context and rationale.' },
  { name: 'owner_workload', description: 'See action item workload by person — open items, overdue counts, completion rates, and who is overloaded.' },
  { name: 'follow_ups', description: 'Generate a follow-up report — overdue items, upcoming deadlines, in-progress work, and recent key decisions.' },
];

const exampleQueries = [
  'Who owns the Q2 roadmap decisions from last week?',
  'Show me all overdue action items — sorted by priority',
  'What did we decide about the client portal architecture?',
  'Which team member has the most open action items right now?',
  'Give me a follow-up report for this week',
  'Search all meetings where security was discussed',
];

export default function Day27Page() {
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
              <MessageSquareText className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 27 &mdash; AI Engineering</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">AI Meeting Notes & Action Items</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            The meeting ended 5 minutes ago. Everyone already forgot what was decided.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that turns meeting chaos into clarity &mdash; searchable notes, tracked action items with owners and deadlines,
            a decision log you can actually find things in, and follow-up reports that write themselves.
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
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">The System</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">From Meeting to Accountability</h2>
          <p className="text-charcoal leading-relaxed mb-6">
            Every meeting generates notes, decisions, and action items. This server connects them so nothing falls through the cracks:
          </p>
          <div className="grid gap-4">
            {[
              { step: 'Capture', color: 'bg-blue-500', desc: 'Meeting notes stored with speaker attribution, timestamps, and topics. Summaries link to the full discussion so context is never lost.' },
              { step: 'Extract', color: 'bg-emerald-500', desc: 'Action items pulled from each meeting with owner, priority, and due date. Decisions recorded with context and impact level.' },
              { step: 'Track', color: 'bg-amber-500', desc: 'Every action item has an owner and a deadline. Filter by status, priority, or person. Overdue items surface automatically.' },
              { step: 'Follow Up', color: 'bg-purple-500', desc: 'Generate weekly follow-up reports — overdue items, upcoming deadlines, workload distribution, and key decisions that need attention.' },
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why AI Meeting Notes?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              The average professional spends 31 hours per month in meetings. And the number one complaint
              isn&apos;t that there are too many meetings &mdash; it&apos;s that nothing happens after them. Decisions
              get forgotten. Action items live in someone&apos;s head. Follow-ups don&apos;t happen.
            </p>
            <p>
              The problem isn&apos;t note-taking &mdash; it&apos;s that notes sit in a doc nobody reads again.
              What teams actually need is a system that connects what was decided to who owns what and when
              it&apos;s due. One question: &ldquo;What&apos;s overdue from last week?&rdquo; and you have your
              standup agenda.
            </p>
            <p className="font-medium text-ink">
              This tool turns meetings into accountability. Search any past meeting, track every action item,
              and generate follow-ups that actually get things done. Fourth AI Engineering build of the challenge.
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
              { label: 'Meetings', value: '15' },
              { label: 'Participants', value: '12' },
              { label: 'Action Items', value: '38' },
              { label: 'Decisions', value: '15' },
              { label: 'Meeting Notes', value: '22' },
              { label: 'Meeting Types', value: '8' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            15 realistic meetings across 8 types — sprint planning, retros, architecture reviews, postmortems,
            1:1s, standups, cross-functional syncs, and all-hands. 12 team members across Engineering, Product,
            Design, Marketing, QA, and Sales. 38 action items with owners, priorities, due dates, and status tracking.
            15 key decisions with context and impact levels.
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
              <code>{`cd day27-meeting-notes
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Want your meetings to actually lead to action?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your team&apos;s decisions keep getting lost between meetings, let&apos;s build a system that makes accountability automatic.
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
          <p className="text-xs text-clay">Day 27 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
