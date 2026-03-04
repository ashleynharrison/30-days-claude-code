import { FileSearch, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'document_search', description: 'Search and browse contracts by title, type (MSA, NDA, lease, etc.), or status' },
  { name: 'party_lookup', description: 'Find parties across all documents — names, roles, entity types, and contact info' },
  { name: 'key_dates_tracker', description: 'Track deadlines, expirations, and renewal dates — flags overdue items' },
  { name: 'obligation_tracker', description: 'Party obligations grouped by document — payment terms, compliance, restrictions' },
  { name: 'clause_analyzer', description: 'Analyze clauses across documents — termination, IP, non-compete — with risk levels' },
  { name: 'red_flags', description: 'Surface risks and red flags — severity-ranked with section refs and recommendations' },
];

const exampleQueries = [
  'What contracts are expiring in the next 6 months?',
  'Show me all high-severity red flags across our documents',
  'What are Cascade Digital\u2019s obligations under the lease?',
  'Does the CloudVault license auto-renew? When do we need to cancel by?',
  'What non-compete clauses do we have and are any high risk?',
  'What deadlines are coming up in the next 30 days?',
];

export default function Day9Page() {
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
              <FileSearch className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 9 &mdash; AI Engineering / Legal</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">AI Document Analyzer</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Hand it a contract. Get back: parties, key dates, obligations, red flags.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that turns a stack of legal documents into a queryable knowledge base.
            Ask about any contract in plain English &mdash; no more ctrl+F through 30-page PDFs.
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Document Analysis?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Every company has a drawer full of contracts they signed but never read again. The lease auto-renewed.
              The non-compete is unenforceable. The vendor agreement expired three months ago.
            </p>
            <p>
              Legal teams charge $500/hour to read these. Paralegals spend days building clause comparison spreadsheets.
              Meanwhile, the CEO asks &ldquo;when does our office lease expire?&rdquo; and nobody knows without digging.
            </p>
            <p className="font-medium text-ink">
              This is the first AI Engineering build in the challenge. Same MCP pattern, but the value proposition shifts from
              &ldquo;query your data&rdquo; to &ldquo;understand your documents.&rdquo;
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
              { label: 'Documents', value: '10' },
              { label: 'Parties', value: '20' },
              { label: 'Key Dates', value: '31' },
              { label: 'Obligations', value: '26' },
              { label: 'Clauses', value: '25' },
              { label: 'Red Flags', value: '14' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            10 realistic legal documents for a mid-size digital agency: MSA, NDA, commercial lease, software license,
            employment agreement, contractor agreement, partnership, vendor contract, settlement, and a DPA under review.
            Includes edge cases &mdash; an expired vendor contract, a settlement with payment deadlines, an auto-renewing license
            with an 8% increase, and a non-compete that may not be enforceable in California.
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
              <code>{`cd day09-document-analyzer
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Drowning in contracts?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your team spends more time searching for answers in documents than acting on them, let&apos;s build something better.
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
          <p className="text-xs text-clay">Day 9 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
