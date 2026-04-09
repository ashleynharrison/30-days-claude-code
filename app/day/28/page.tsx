import { LayoutDashboard, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'client_overview', description: 'Full client profile — active projects, outstanding invoices, unread messages, recent activity, and revenue totals.' },
  { name: 'project_status', description: 'Detailed project view — deliverables with approval status, timeline progress, budget usage, and billing breakdown.' },
  { name: 'invoice_tracker', description: 'Track invoices across all clients — filter by status, find overdue payments, and see aggregate revenue summaries.' },
  { name: 'deliverable_approvals', description: 'Monitor deliverable approvals — items awaiting review, overdue milestones, and approval history by client.' },
  { name: 'message_inbox', description: 'Client message center — unread threads, pending responses, and conversation history across all projects.' },
  { name: 'pipeline_summary', description: 'Business dashboard — active pipeline value, revenue metrics, project health, and at-risk items that need attention.' },
];

const exampleQueries = [
  'Give me a full overview of the Greenleaf Wellness account',
  'Which invoices are overdue right now?',
  'What deliverables are waiting for client approval?',
  'Show me all unread messages — who needs a response?',
  'How is the Investor Dashboard project tracking against budget?',
  'Give me a pipeline summary with at-risk items',
];

export default function Day28Page() {
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
              <LayoutDashboard className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 28 &mdash; Custom Development</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Interactive Client Portal</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Your clients shouldn&apos;t have to email you to check project status.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that powers a complete client portal &mdash; project timelines, deliverable approvals,
            invoice history, messaging, and a pipeline dashboard. Ask a question instead of digging through spreadsheets.
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">From Inbox Chaos to Client Clarity</h2>
          <p className="text-charcoal leading-relaxed mb-6">
            Every agency runs on client relationships. This portal centralizes the moving parts so nothing gets lost:
          </p>
          <div className="grid gap-4">
            {[
              { step: 'Projects', color: 'bg-blue-500', desc: 'Track every project with deliverables, timelines, and budget usage. Know at a glance which projects are on track and which need attention.' },
              { step: 'Approvals', color: 'bg-emerald-500', desc: 'Deliverables flow through a clear approval pipeline. See what\'s pending review, what\'s been approved, and what\'s overdue — across every client.' },
              { step: 'Billing', color: 'bg-amber-500', desc: 'Invoices tied to projects and milestones. Track paid, sent, and overdue invoices. Know your revenue, outstanding balance, and cash flow at any time.' },
              { step: 'Communication', color: 'bg-purple-500', desc: 'Client messages organized by project. See unread threads, pending responses, and conversation history. Never miss a client request again.' },
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why a Client Portal?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Every agency has the same problem: clients want visibility, and you want to stop answering
              &ldquo;where are we on this?&rdquo; emails. The typical solution is a shared Google Doc
              that nobody updates, or a project management tool that clients never log into.
            </p>
            <p>
              What clients actually want is simple &mdash; a place to see their project timeline, approve
              deliverables, check invoice status, and send a message. What agencies want is even simpler &mdash;
              to stop context-switching between Slack, email, Notion, and QuickBooks to answer one question.
            </p>
            <p className="font-medium text-ink">
              This portal connects everything. One question &mdash; &ldquo;How is the Greenleaf account doing?&rdquo; &mdash;
              and you get projects, deliverables, invoices, messages, and activity in one view. First Custom Development
              build of the challenge.
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
              { label: 'Clients', value: '8' },
              { label: 'Projects', value: '12' },
              { label: 'Deliverables', value: '30' },
              { label: 'Invoices', value: '22' },
              { label: 'Messages', value: '13' },
              { label: 'Activity Log', value: '24' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            8 realistic clients across Healthcare, Finance, Hospitality, Legal, Creative, Construction, Education,
            and SaaS. 12 projects at various stages — from planning to completed. 30 deliverables with approval
            workflows. 22 invoices with payment tracking. Real conversation threads and a full activity timeline.
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
              <code>{`cd day28-client-portal
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Want a client portal that actually gets used?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your clients keep asking &ldquo;where are we on this?&rdquo; — let&apos;s build them a place to find out themselves.
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
          <p className="text-xs text-clay">Day 28 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
