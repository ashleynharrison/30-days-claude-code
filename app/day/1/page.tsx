import { Scale, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'search_cases', description: 'Search by client, type, status, attorney, or free text' },
  { name: 'get_case_details', description: 'Full case record with tasks and client info' },
  { name: 'upcoming_hearings', description: 'All hearings within a date range' },
  { name: 'overdue_tasks', description: 'Tasks past due, with case context' },
  { name: 'case_stats', description: 'Dashboard summary across the firm' },
  { name: 'search_clients', description: 'Client lookup with associated cases' },
];

const exampleQueries = [
  'Which cases have hearings this week?',
  "Show me all of Maria's active immigration cases",
  'What tasks are overdue?',
  'Give me a summary of case 2025-CV-0142',
  'How many active cases does each attorney have?',
];

export default function Day1Page() {
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
              <Scale className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">
                Day 1 &mdash; Legal
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">
                Legal Firm Case Manager
              </h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Talk to your cases.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that connects a legal firm&apos;s case management data to Claude.
            No dashboard to learn. No tabs to click through. Just ask.
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

      {/* Why Legal */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">
            Why This Industry
          </p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Legal?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Before tech, I worked at an immigration law firm in Los Angeles, coordinating intake
              across three legal units &mdash; immigration, family law, and civil cases. I&apos;ve seen
              firsthand how much time gets lost digging through case files for basic status updates.
            </p>
            <p>
              This tool makes that a one-sentence question.
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
              { label: 'Clients', value: '15' },
              { label: 'Cases', value: '20' },
              { label: 'Tasks', value: '43' },
              { label: 'Attorneys', value: '3+1' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            3 attorneys (Maria Gutierrez, David Chen, Sarah Okafor) + 1 paralegal (Jamie Reeves).
            Realistic LA-area data with relative dates.
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
              <code>{`cd day01-legal-firm
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
            If your team is still digging through files for basic status updates, let&apos;s fix that.
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
            Day 1 of 30. Follow along.
          </p>
        </div>
      </footer>
    </div>
  );
}
