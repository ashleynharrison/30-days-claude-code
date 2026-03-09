import { HandHeart, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'donor_lookup', description: 'Search donors by name, type, giving level, or status. Returns contact info, giving history, and engagement summary.' },
  { name: 'donation_history', description: 'View donation records with filters for donor, campaign, date range, amount, and payment method. Includes totals and averages.' },
  { name: 'campaign_dashboard', description: 'Campaign performance — progress to goal, donor counts, top contributors, and recent donations.' },
  { name: 'grant_tracker', description: 'View grants by status, upcoming deadlines, success rate, and pipeline value. Track submissions and reporting.' },
  { name: 'retention_report', description: 'Donor retention analysis — LYBUNT, SYBUNT, lapsed donors, new donors, and year-over-year retention rate.' },
  { name: 'engagement_log', description: 'Donor engagement history — meetings, calls, emails, events. Identify donors needing outreach.' },
];

const exampleQueries = [
  'Who gave last year but hasn\u2019t donated yet this year?',
  'Show me all major donors and their last gift date',
  'How is the capital campaign performing against its $500K goal?',
  'What grants are due this quarter and what\u2019s our success rate?',
  'Which donors haven\u2019t been contacted in the last 30 days?',
  'Show me all donations from TechBridge Solutions',
];

export default function Day14Page() {
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
              <HandHeart className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 14 &mdash; Nonprofit</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Nonprofit Donor & Grant Tracker</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Track donors, donations, campaigns, grants, and the metric that keeps nonprofits alive &mdash; retention.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that gives development teams instant answers about their donor base. Who gave last year but not this year?
            How is the capital campaign tracking? Which grants are due? Ask a question, get the answer.
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

      {/* Campaign Previews */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Demo Campaigns</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">6 Active & Completed Campaigns</h2>
          <div className="grid gap-4">
            {[
              { name: '2026 Annual Fund', type: 'Annual Fund', goal: '$200K', raised: '$87.5K', pct: 44, status: 'active', donors: 42 },
              { name: 'New Community Center', type: 'Capital Campaign', goal: '$500K', raised: '$215K', pct: 43, status: 'active', donors: 18 },
              { name: 'Youth Mentorship Expansion', type: 'Program', goal: '$45K', raised: '$28K', pct: 62, status: 'active', donors: 15 },
              { name: 'GivingTuesday 2025', type: 'Event', goal: '$25K', raised: '$31.2K', pct: 125, status: 'completed', donors: 127 },
            ].map((campaign) => (
              <div key={campaign.name} className="p-6 bg-white border border-sand rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink">{campaign.name}</h3>
                    <p className="text-sm text-clay">{campaign.type}</p>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded-full ${
                    campaign.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 mb-3">
                  <div>
                    <span className="font-mono text-2xl font-bold text-ink">{campaign.raised}</span>
                    <span className="text-xs text-clay ml-1">of {campaign.goal}</span>
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold text-terracotta">{campaign.pct}%</span>
                  </div>
                  <div>
                    <span className="font-mono text-lg font-bold text-ink">{campaign.donors}</span>
                    <span className="text-xs text-clay ml-1">donors</span>
                  </div>
                </div>
                <div className="w-full bg-sand/50 rounded-full h-2">
                  <div className={`h-2 rounded-full ${campaign.pct >= 100 ? 'bg-green-500' : 'bg-terracotta'}`}
                    style={{ width: `${Math.min(campaign.pct, 100)}%` }} />
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Donor Tracking?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Nonprofits live and die by donor retention. The industry average hovers around 45% &mdash; meaning
              more than half of last year&apos;s donors don&apos;t come back. Most organizations know this
              intellectually but can&apos;t answer the most basic question: &ldquo;Who gave last year but hasn&apos;t this year?&rdquo;
            </p>
            <p>
              The data exists. It&apos;s in spreadsheets, CRMs, and grant portals. But pulling a LYBUNT report,
              cross-referencing it with engagement history, and prioritizing outreach takes hours. By the time
              the development director gets to it, another donor has quietly lapsed.
            </p>
            <p className="font-medium text-ink">
              This server makes donor intelligence conversational. Ask about retention, campaign progress, grant
              deadlines, or engagement gaps &mdash; and get answers that would normally require a reporting tool,
              a database query, and a good memory. Fifteen donors, six campaigns, seven grants, and the kind of
              realistic data that makes the tool immediately useful.
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
              { label: 'Donors', value: '15' },
              { label: 'Campaigns', value: '6' },
              { label: 'Donations', value: '39' },
              { label: 'Grants', value: '7' },
              { label: 'Pledges', value: '7' },
              { label: 'Engagements', value: '16' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            15 donors spanning individuals, corporations, and foundations across four giving levels.
            Six campaigns including an annual fund, capital campaign, and GivingTuesday event. Seven grants
            in various stages from submitted to awarded to rejected. Realistic engagement history with
            three staff members and multiple outreach types.
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
              <code>{`cd day14-nonprofit-donor
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Need a smarter way to manage your donor data?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your development team is still pulling LYBUNT reports from spreadsheets, let&apos;s talk about what&apos;s possible.
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
          <p className="text-xs text-clay">Day 14 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
