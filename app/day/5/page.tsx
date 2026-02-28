import { UtensilsCrossed, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'reservation_lookup', description: 'Search by date, guest name, party size, or status' },
  { name: 'menu_performance', description: 'Top sellers, revenue, margins — filterable by date range and category' },
  { name: 'staff_schedule', description: 'Who\u2019s working, shift coverage, clock in/out times' },
  { name: 'service_recap', description: 'Nightly recap — covers, revenue, avg check, turn time, top sellers, server performance' },
  { name: 'eighty_six_status', description: 'What\u2019s currently 86\u2019d and why, plus recent history' },
  { name: 'table_status', description: 'Real-time floor view — open, occupied, reserved, cleaning' },
];

const exampleQueries = [
  'What sold out last Friday night and what sat in the kitchen?',
  'Which tables are open right now?',
  'How did Sophie do in tips last Friday?',
  'What\u2019s our highest-margin entree?',
  'Who\u2019s scheduled to work tonight?',
  'Any no-shows or cancellations from Friday\u2019s service?',
];

export default function Day5Page() {
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
              <UtensilsCrossed className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">
                Day 5 &mdash; Restaurants / Hospitality
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">
                Restaurant Manager
              </h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Your host stand just got a lot smarter.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that connects a restaurant&apos;s reservations, menu analytics, staff scheduling,
            floor status, and service recaps to Claude. Ask a question, get the answer &mdash; no more
            digging through four different systems.
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Restaurants?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              A restaurant manager&apos;s job is 20% hospitality and 80% context-switching. Reservation system,
              POS, scheduling app, inventory spreadsheet &mdash; none of them talk to each other.
            </p>
            <p>
              &ldquo;What sold out Friday?&rdquo; shouldn&apos;t require pulling reports from two different systems.
              &ldquo;Who&apos;s working tonight?&rdquo; shouldn&apos;t mean opening a separate app.
            </p>
            <p className="font-medium text-ink">
              One question. One answer. Back to the floor.
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
              { label: 'Staff', value: '12' },
              { label: 'Menu Items', value: '30' },
              { label: 'Reservations', value: '34' },
              { label: 'Orders', value: '25' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            Includes a full Friday night service (19 closed orders, 70 covers, $4,700+ revenue),
            today&apos;s live floor with 6 open tables, 86&apos;d items (lobster ran out, tuna delivery
            delayed), no-shows, a birthday party in private dining, and an anniversary with champagne.
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
              <code>{`cd day05-restaurant
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
            Want one for your restaurant?
          </h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your manager is still toggling between four apps to answer one question, let&apos;s fix that.
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
            Day 5 of 30. Follow along.
          </p>
        </div>
      </footer>
    </div>
  );
}
