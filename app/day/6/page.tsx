import { Dumbbell, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'member_lookup', description: 'Search by name, membership type, status, or join date — includes activity stats' },
  { name: 'class_schedule', description: 'Upcoming and past sessions with booking counts, availability, and instructor' },
  { name: 'attendance_report', description: 'Fill rates, no-show rates, and popular time slots across all classes' },
  { name: 'at_risk_members', description: 'Flag members who haven\u2019t visited recently — with revenue at risk' },
  { name: 'instructor_stats', description: 'Classes taught, avg attendance, fill rates, and cost per attendee' },
  { name: 'revenue_snapshot', description: 'Membership revenue, expiring class packs, upcoming renewals, frozen accounts' },
];

const exampleQueries = [
  'Which members haven\u2019t shown up in over 3 weeks?',
  'What\u2019s our class fill rate for spin this month?',
  'Who has a class pack about to expire?',
  'How is Maya performing compared to other instructors?',
  'Which memberships are renewing in the next 2 weeks?',
  'Show me all active members on unlimited monthly plans',
];

export default function Day6Page() {
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
              <Dumbbell className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">
                Day 6 &mdash; Fitness / Wellness
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">
                Fitness Studio Manager
              </h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Your front desk just got a brain.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that connects a fitness studio&apos;s members, class schedule, attendance data,
            instructor performance, and revenue metrics to Claude. Ask about your business and get real
            answers &mdash; no spreadsheets required.
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

      {/* Why This Industry */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">
            Why This Industry
          </p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Fitness Studios?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Studio owners live in Mindbody, Google Sheets, and their gut. Member retention is everything,
              but most can&apos;t answer &ldquo;who&apos;s about to cancel?&rdquo; without pulling three reports.
            </p>
            <p>
              Class packs expire silently. Renewals slip. That regular who stopped showing up three
              weeks ago? Nobody noticed until they cancelled.
            </p>
            <p className="font-medium text-ink">
              This tool catches what the front desk misses.
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
              { label: 'Members', value: '25' },
              { label: 'Instructors', value: '6' },
              { label: 'Weekly Classes', value: '19' },
              { label: 'Class Instances', value: '120+' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            Includes realistic edge cases: members who dropped off after 3+ weeks with renewal coming up,
            class packs down to 1-2 remaining classes, frozen memberships (medical and travel), a
            founding member who&apos;s been there 14 months, an annual member barely using their plan,
            cancelled members with expired packs, and a drop-in exploring membership.
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
              <code>{`cd day06-fitness
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
            Want one for your studio?
          </h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your front desk is still pulling three reports to answer one question, let&apos;s fix that.
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
            Day 6 of 30. Follow along.
          </p>
        </div>
      </footer>
    </div>
  );
}
