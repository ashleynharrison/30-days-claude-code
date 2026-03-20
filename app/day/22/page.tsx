import { Landmark, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'list_clients', description: 'List and search wealth management clients. Shows portfolio summary, risk profile, advisor assignment, and total AUM.' },
  { name: 'get_portfolio', description: 'Get a client\'s full portfolio breakdown across all accounts — holdings, allocation, performance, and drift analysis vs. model portfolio.' },
  { name: 'get_account', description: 'Get detailed view of a single investment account — holdings by weight, sector breakdown, recent transactions, and performance.' },
  { name: 'list_transactions', description: 'Search and filter transactions across accounts. Filter by client, type, or symbol. Shows totals by transaction type.' },
  { name: 'portfolio_analysis', description: 'Run risk and allocation analysis — diversification score, concentration risks, sector exposure, and rebalancing recommendations.' },
  { name: 'get_alerts', description: 'Get portfolio alerts — concentration warnings, rebalance triggers, RMD deadlines, contribution reminders, and performance flags.' },
];

const exampleQueries = [
  'Show me all clients managed by David Park',
  'Pull up Margaret Chen\'s full portfolio with allocation drift',
  'What are the top concentration risks across all clients?',
  'Show me all dividend transactions from the last 30 days',
  'Run a portfolio analysis on James Okafor — is he too concentrated?',
  'What alerts need attention this week?',
];

export default function Day22Page() {
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
              <Landmark className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 22 &mdash; MCP Integration</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Wealth Management Portfolio Tracker</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Your client calls. &ldquo;How&apos;s my portfolio doing?&rdquo; You open four tabs, three spreadsheets, and a PDF.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that tracks client portfolios across accounts, custodians, and asset classes. Holdings, allocation drift,
            risk analysis, transaction history, and alerts &mdash; all from one question instead of four systems.
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

      {/* Client Portfolios */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Client Book</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">6 Sample Clients</h2>
          <div className="grid gap-4">
            {[
              { name: 'Margaret Chen', profile: 'Moderate', goal: 'Retirement + legacy', accounts: 2, aum: '$2.45M', advisor: 'David Park' },
              { name: 'Robert & Linda Vasquez', profile: 'Conservative', goal: 'Capital preservation + income', accounts: 3, aum: '$4.20M', advisor: 'David Park' },
              { name: 'James Okafor', profile: 'Aggressive', goal: 'Growth + accumulation', accounts: 2, aum: '$890K', advisor: 'Sarah Mitchell' },
              { name: 'Diane Whitfield-Torres', profile: 'Moderate-Aggressive', goal: 'Trust mgmt + philanthropy', accounts: 2, aum: '$6.80M', advisor: 'Sarah Mitchell' },
              { name: 'Kevin Park', profile: 'Moderate', goal: 'College fund + retirement', accounts: 3, aum: '$520K', advisor: 'David Park' },
              { name: 'Amara Singh', profile: 'Aggressive', goal: 'Growth + early retirement', accounts: 2, aum: '$1.35M', advisor: 'Sarah Mitchell' },
            ].map((client) => (
              <div key={client.name} className="p-6 bg-white border border-sand rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink">{client.name}</h3>
                    <p className="text-sm text-clay">{client.goal} &middot; {client.advisor}</p>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded-full ${
                    client.profile === 'Conservative' ? 'bg-blue-100 text-blue-700' :
                    client.profile === 'Moderate' ? 'bg-green-100 text-green-700' :
                    client.profile === 'Moderate-Aggressive' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {client.profile}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="font-mono text-sm font-bold text-ink">{client.aum}</span>
                  </div>
                  <div>
                    <span className="font-mono text-xs text-clay">{client.accounts} accounts</span>
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why a Wealth Management Tracker?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Wealth advisors live in a world of fragmented data. Client portfolios are spread across custodians,
              account types, and asset classes. Answering &ldquo;how am I doing?&rdquo; means logging into Schwab,
              pulling a Fidelity report, checking the 529 balances, and doing mental math on allocation drift.
            </p>
            <p>
              Most portfolio management software costs $10K+/year and still requires manual data entry. The advisor
              ends up spending more time pulling reports than actually advising clients. Meanwhile, the client just
              wants a straight answer.
            </p>
            <p className="font-medium text-ink">
              This server manages six clients with $16M+ in combined assets across 14 accounts. It tracks 41 holdings,
              computes allocation drift against model portfolios, scores diversification, flags concentration risks,
              and surfaces alerts for RMDs, rebalancing, and contribution limits. Ask a question, get the answer.
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
              { label: 'Clients', value: '6' },
              { label: 'Accounts', value: '14' },
              { label: 'Holdings', value: '41' },
              { label: 'Transactions', value: '20' },
              { label: 'Model Allocations', value: '20' },
              { label: 'Alerts', value: '8' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            Six clients from conservative retirees to aggressive accumulators. Fourteen accounts spanning trusts,
            IRAs, Roth IRAs, 529 plans, SEP IRAs, and charitable remainder trusts. Four risk profiles with model
            allocations. Realistic edge cases &mdash; single-stock concentration risk, missing international exposure,
            RMD deadlines, and a client targeting early retirement at 50.
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
              <code>{`cd day22-wealth-management
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Tired of logging into four custodian portals?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your client book lives across spreadsheets, PDFs, and custodian dashboards &mdash;
            let&apos;s talk about bringing it all into one conversation.
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
          <p className="text-xs text-clay">Day 22 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
