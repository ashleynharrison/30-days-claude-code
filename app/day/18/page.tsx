import { Target, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'competitor_lookup', description: 'Search competitors by name, category, or status. Returns company info, funding, headcount, pricing tiers, and latest market moves.' },
  { name: 'pricing_comparison', description: 'Compare pricing across competitors. Shows tiers, monthly/annual prices, billing models, and key limits.' },
  { name: 'feature_matrix', description: 'Compare features across competitors with maturity levels. Shows coverage percentages and gaps by category.' },
  { name: 'market_moves', description: 'Track competitor announcements, launches, funding, hires, partnerships, and pricing changes with impact ratings.' },
  { name: 'positioning_analysis', description: 'Compare positioning — taglines, target audiences, value propositions, differentiators, and messaging tone.' },
  { name: 'win_loss_tracker', description: 'Review competitive deals — win/loss outcomes, deal sizes, reasons, and patterns by competitor or industry.' },
];

const exampleQueries = [
  'What are our top 3 competitors doing differently?',
  'Compare pricing across all competitors — who is cheapest?',
  'Which competitors have AI features and how mature are they?',
  'Show me all high-impact market moves in the last 60 days',
  'What deals have we lost to RivalStack and why?',
  'How does CloudPilot position themselves vs BuildForge?',
];

export default function Day18Page() {
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
              <Target className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 18 &mdash; Digital Strategy</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Competitive Analysis Dashboard</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Track competitors&apos; pricing, features, positioning, and market moves &mdash; then ask questions instead of digging through spreadsheets.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that turns competitive intelligence into a conversation. Pricing comparisons, feature matrices,
            win/loss patterns, and market move timelines. One question, one answer.
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

      {/* Competitor Previews */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Competitive Landscape</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">6 Competitors Tracked</h2>
          <div className="grid gap-4">
            {[
              { name: 'RivalStack', category: 'Developer Tools', funding: '$42M Series B', employees: '150-200', threat: 'high' },
              { name: 'CloudPilot', category: 'Developer Tools', funding: '$28M Series A', employees: '80-120', threat: 'high' },
              { name: 'BuildForge', category: 'Developer Tools', funding: '$85M Series C', employees: '300-400', threat: 'medium' },
              { name: 'DeployHQ', category: 'DevOps', funding: '$12M Seed+', employees: '40-60', threat: 'low' },
              { name: 'ShipFast', category: 'Developer Tools', funding: '$5M Seed', employees: '20-30', threat: 'medium' },
              { name: 'PlatformNine', category: 'Platform Engineering', funding: '$120M Series D', employees: '500-700', threat: 'low' },
            ].map((comp) => (
              <div key={comp.name} className="p-6 bg-white border border-sand rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink">{comp.name}</h3>
                    <p className="text-sm text-clay">{comp.category}</p>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded-full ${
                    comp.threat === 'high' ? 'bg-red-100 text-red-700' :
                    comp.threat === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {comp.threat} threat
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="font-mono text-sm font-bold text-ink">{comp.funding}</span>
                    <span className="text-xs text-clay ml-1">raised</span>
                  </div>
                  <div>
                    <span className="font-mono text-sm font-bold text-terracotta">{comp.employees}</span>
                    <span className="text-xs text-clay ml-1">employees</span>
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Competitive Analysis?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Every strategy team has a competitive spreadsheet. It starts clean, gets updated for a board meeting,
              then slowly rots until someone asks a question nobody can answer without an hour of Googling.
            </p>
            <p>
              The data exists &mdash; pricing pages, press releases, LinkedIn headcount, deal notes from your CRM.
              But it&apos;s scattered across a dozen tabs and nobody&apos;s job to maintain it. By the time the next
              competitive deal comes in, your intel is three months stale.
            </p>
            <p className="font-medium text-ink">
              This server makes competitive intelligence queryable. Six competitors, 21 pricing tiers, a 16-feature
              comparison matrix, market move timelines, positioning snapshots, and win/loss tracking. Ask a question
              about the competitive landscape and get an answer backed by structured data.
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
              { label: 'Competitors', value: '6' },
              { label: 'Pricing Tiers', value: '21' },
              { label: 'Features Tracked', value: '96' },
              { label: 'Market Moves', value: '16' },
              { label: 'Positioning Snapshots', value: '6' },
              { label: 'Win/Loss Records', value: '10' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            Six competitors ranging from a $5M seed-stage startup to a $120M enterprise heavyweight. Realistic pricing
            across free, pro, and enterprise tiers. A 16-feature comparison matrix spanning CI/CD, security, analytics,
            collaboration, and AI. Market moves from product launches to acquisitions. Win/loss deals with reasons and
            deal sizes.
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
              <code>{`cd day18-competitive-analysis
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Need a competitive intelligence tool that actually gets used?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your competitive data lives in a spreadsheet nobody updates, let&apos;s talk about making it conversational.
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
          <p className="text-xs text-clay">Day 18 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
