import { FileText, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'generate_proposal', description: 'Generate a new proposal from a client brief. Auto-selects template, recommends services, estimates pricing, and drafts every section.' },
  { name: 'list_proposals', description: 'List and search proposals by status, client, or date. Shows pipeline overview with total values at each stage.' },
  { name: 'get_proposal', description: 'Get the full proposal document — all sections, line items, client details, and totals. Ready to review or edit.' },
  { name: 'list_services', description: 'Browse service offerings with rates, typical hours, and deliverables. Filter by category to build the right scope.' },
  { name: 'list_templates', description: 'View available proposal templates — SOW, quick proposal, discovery, retainer. Shows sections, tone, and when to use each.' },
  { name: 'estimate_scope', description: 'Estimate hours, cost, and timeline from requirements. Returns low/mid/high estimates with budget and timeline feasibility.' },
];

const exampleQueries = [
  'Generate a proposal for NovaByte — they need a multi-tenant analytics dashboard',
  'Show me all proposals that are currently in draft',
  'What services do we offer for AI engineering?',
  'Estimate the scope for a patient portal with booking and intake forms',
  'Pull up the full proposal for Whitfield & Associates',
  'Which proposals have been accepted and what\'s the total revenue?',
];

export default function Day21Page() {
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
              <FileText className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 21 &mdash; AI Engineering</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">AI Proposal Writer</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            You spend 4 hours writing a proposal. The client spends 4 minutes reading it.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that drafts SOWs, scopes, and pricing from a brief. Give it a client and what they need &mdash;
            get back a full proposal with sections, line items, and a timeline. You edit and send. Done.
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

      {/* Proposal Pipeline */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Pipeline</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">6 Sample Proposals</h2>
          <div className="grid gap-4">
            {[
              { title: 'Case Management & Client Intake', client: 'Whitfield & Associates', industry: 'Legal', status: 'accepted', value: '$20,400', weeks: 8 },
              { title: 'Multi-Tenant Analytics Dashboard', client: 'NovaByte', industry: 'SaaS', status: 'sent', value: '$34,500', weeks: 6 },
              { title: 'Patient Portal & Booking System', client: 'Verdant Wellness', industry: 'Health & Wellness', status: 'draft', value: '$9,900', weeks: 4 },
              { title: 'Donor Management & Grant Tracker', client: 'Bright Futures Foundation', industry: 'Nonprofit', status: 'accepted', value: '$6,975', weeks: 3 },
              { title: 'Listings Platform Discovery', client: 'Coastal Realty Partners', industry: 'Real Estate', status: 'sent', value: '$4,000', weeks: 2 },
              { title: 'Project Tracker MVP', client: 'Summit Construction Group', industry: 'Construction', status: 'declined', value: '$8,250', weeks: 3 },
            ].map((proposal) => (
              <div key={proposal.title} className="p-6 bg-white border border-sand rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink">{proposal.title}</h3>
                    <p className="text-sm text-clay">{proposal.client} &middot; {proposal.industry}</p>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded-full ${
                    proposal.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    proposal.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                    proposal.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {proposal.status}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="font-mono text-sm font-bold text-ink">{proposal.value}</span>
                  </div>
                  <div>
                    <span className="font-mono text-xs text-clay">{proposal.weeks} weeks</span>
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why an AI Proposal Writer?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Every consultancy has the same bottleneck: writing proposals. You finish a great discovery call,
              and then you spend 4 hours formatting a document the client will skim in 4 minutes. Meanwhile,
              two other leads go cold because you didn&apos;t follow up fast enough.
            </p>
            <p>
              Most proposal tools are either glorified templates (you still write everything) or fully automated
              garbage (the client can tell). The sweet spot is in between &mdash; generate the structure, the
              pricing, the sections, and the scope automatically, then let a human refine the parts that matter.
            </p>
            <p className="font-medium text-ink">
              This server manages six clients, eight service offerings, four proposal templates, and a pipeline
              of proposals at every stage. Ask it to generate a proposal from a brief and it&apos;ll pick the right
              template, recommend services, estimate hours, calculate pricing, and draft every section. You edit,
              you send, you close.
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
              { label: 'Services', value: '8' },
              { label: 'Templates', value: '4' },
              { label: 'Proposals', value: '6' },
              { label: 'Sections', value: '12' },
              { label: 'Line Items', value: '14' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            Six clients across legal, SaaS, health &amp; wellness, construction, nonprofit, and real estate.
            Eight service offerings from MCP development to strategy consulting. Four proposal templates
            (SOW, quick proposal, discovery, retainer). A realistic pipeline with accepted, sent, draft,
            and declined proposals &mdash; including one client who went with a cheaper competitor.
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
              <code>{`cd day21-ai-proposal-writer
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Tired of writing proposals from scratch?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your proposal process is a bottleneck between &ldquo;great call&rdquo; and &ldquo;closed deal,&rdquo;
            let&apos;s talk about automating the tedious parts.
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
          <p className="text-xs text-clay">Day 21 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
