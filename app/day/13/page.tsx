import { ShieldCheck, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'project_config', description: 'View project auth configuration — providers, MFA settings, session lifetimes, roles overview, and user/policy counts' },
  { name: 'role_permissions', description: 'Explore role hierarchies and their permissions — grouped by resource with conditions and priority levels' },
  { name: 'rls_inspector', description: 'Inspect Row Level Security policies — USING/CHECK expressions, coverage analysis, and unprotected operations' },
  { name: 'user_access', description: 'Look up a user\'s effective permissions, role, MFA compliance, and recent auth activity' },
  { name: 'security_audit', description: 'Run a full security audit — MFA gaps, suspicious logins, overly permissive roles, session risks, and RLS coverage' },
  { name: 'auth_events', description: 'View auth event logs — sign-ins, failures, role changes, MFA events, and suspicious activity with IP tracking' },
];

const exampleQueries = [
  'Show me the auth config for the HealthVault project',
  'What permissions does the doctor role have in HealthVault?',
  'Are there any tables missing RLS policies in ShopFront?',
  'Look up sarah@taskflow.io — what\'s her role and MFA status?',
  'Run a security audit on the TaskFlow SaaS project',
  'Show me all failed login attempts across TaskFlow',
];

export default function Day13Page() {
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
              <ShieldCheck className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 13 &mdash; Auth & Security</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Auth & RLS Starter Kit</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Audit your auth setup before it becomes a breach. Inspect roles, permissions, RLS policies, and MFA compliance &mdash; all through natural language.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that models real-world auth configurations across three different project types. Explore role hierarchies,
            Row Level Security expressions, user access matrices, and run security audits that catch what you missed.
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

      {/* Project Previews */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Demo Projects</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">3 Auth Configurations</h2>
          <div className="grid gap-4">
            {[
              { name: 'TaskFlow SaaS', type: 'Project Management', roles: 4, users: 5, rls: 6, mfa: true, score: 'C (70)', highlight: '2 users missing MFA, DELETE policies absent' },
              { name: 'HealthVault Portal', type: 'HIPAA Healthcare', roles: 4, users: 6, rls: 6, mfa: true, score: 'B (80)', highlight: 'Conditional permissions, own-record-only access' },
              { name: 'ShopFront Marketplace', type: 'Multi-Vendor E-Commerce', roles: 3, users: 5, rls: 7, mfa: false, score: 'C (65)', highlight: 'No MFA, missing DELETE/UPDATE RLS policies' },
            ].map((project) => (
              <div key={project.name} className="p-6 bg-white border border-sand rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink">{project.name}</h3>
                    <p className="text-sm text-clay">{project.type}</p>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded-full ${
                    project.mfa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    MFA {project.mfa ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex items-center gap-6 mb-2">
                  <div>
                    <span className="font-mono text-2xl font-bold text-ink">{project.roles}</span>
                    <span className="text-xs text-clay ml-1">roles</span>
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold text-ink">{project.users}</span>
                    <span className="text-xs text-clay ml-1">users</span>
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold text-ink">{project.rls}</span>
                    <span className="text-xs text-clay ml-1">RLS policies</span>
                  </div>
                </div>
                <p className="text-sm text-charcoal mb-1">Audit: <span className="font-mono text-terracotta">{project.score}</span></p>
                <p className="text-sm text-clay">{project.highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Build */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Why This Build</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Auth & RLS?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Auth and Row Level Security are the most silently dangerous parts of any app. Misconfigured RLS policies
              don&apos;t throw errors &mdash; they just quietly expose data. A missing DELETE policy means anyone can
              wipe records. A role with too many permissions becomes a breach waiting to happen.
            </p>
            <p>
              The problem isn&apos;t that teams don&apos;t care about security. It&apos;s that auditing auth config
              requires digging through Supabase dashboards, cross-referencing role tables, and mentally tracing
              policy expressions. Nobody does that regularly.
            </p>
            <p className="font-medium text-ink">
              This server makes auth auditing conversational. Ask &ldquo;who doesn&apos;t have MFA?&rdquo; or
              &ldquo;which tables are missing DELETE policies?&rdquo; and get instant, actionable answers.
              Three real project types &mdash; SaaS, healthcare, and marketplace &mdash; show how auth patterns
              differ by domain.
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
              { label: 'Projects', value: '3' },
              { label: 'Roles', value: '11' },
              { label: 'Permissions', value: '43' },
              { label: 'RLS Policies', value: '19' },
              { label: 'Users', value: '16' },
              { label: 'Auth Events', value: '17' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            3 projects spanning SaaS, healthcare (HIPAA), and multi-vendor marketplace. Each has domain-specific
            roles with hierarchical priorities, granular permissions with conditions, real RLS USING/CHECK expressions,
            users with MFA enrollment status, and auth event logs including suspicious login attempts.
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
              <code>{`cd day13-auth-rls-kit
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Need to audit your auth before it bites you?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your RLS policies haven&apos;t been reviewed since launch and your MFA adoption is &ldquo;optional,&rdquo; let&apos;s talk.
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
          <p className="text-xs text-clay">Day 13 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
