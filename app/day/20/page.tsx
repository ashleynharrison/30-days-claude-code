import { Lock, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'org_lookup', description: 'Search organizations by name, plan, or status. Returns org details, member count, seat usage, SSO/MFA config, and current health.' },
  { name: 'user_permissions', description: 'Check a user\'s role, permissions, and access within an organization. Shows hierarchy level, granted permissions, and MFA compliance.' },
  { name: 'invite_status', description: 'Track invitation status across organizations — pending, accepted, expired, or revoked. Shows who invited whom and when.' },
  { name: 'role_hierarchy', description: 'View the full role hierarchy and permissions matrix for an org. Shows each role\'s level, permissions, and assigned members.' },
  { name: 'audit_log', description: 'Query the auth and access audit log. Filter by org, user, action type, or date range. Surfaces logins, permission changes, and security events.' },
  { name: 'tenant_health', description: 'Get health metrics for an org — active users, MFA adoption, seat usage, login frequency, and a security compliance score.' },
];

const exampleQueries = [
  'Which organizations have MFA required but users not compliant?',
  'Show me the role hierarchy for Acme Corp',
  'Are there any pending invitations that are about to expire?',
  'What permissions does Marcus Lee have at Acme?',
  'Show me failed login attempts in the last 30 days',
  'Which orgs have the lowest security scores?',
];

export default function Day20Page() {
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
              <Lock className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 20 &mdash; Security</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Multi-Tenant Auth System</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Org-level isolation, role hierarchies, invite flows, and audit trails &mdash; the unsexy infrastructure that makes B2B SaaS actually work.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that manages multi-tenant authentication. Ask who has access to what, which orgs are MFA-compliant,
            and whether that pending invite expired. No more digging through admin panels.
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

      {/* Org Previews */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Tenants</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">6 Organizations</h2>
          <div className="grid gap-4">
            {[
              { name: 'Acme Corp', plan: 'enterprise', members: 5, seats: 100, sso: true, mfa: true, score: 75 },
              { name: 'Bright Studio', plan: 'business', members: 4, seats: 25, sso: false, mfa: false, score: 65 },
              { name: 'CloudNine Labs', plan: 'starter', members: 3, seats: 5, sso: false, mfa: false, score: 65 },
              { name: 'Delta Finance', plan: 'enterprise', members: 4, seats: 50, sso: true, mfa: true, score: 70 },
              { name: 'Ember Health', plan: 'business', members: 2, seats: 15, sso: false, mfa: true, score: 85 },
              { name: 'Forge AI', plan: 'starter', members: 1, seats: 5, sso: false, mfa: false, score: 0 },
            ].map((org) => (
              <div key={org.name} className="p-6 bg-white border border-sand rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink">{org.name}</h3>
                    <p className="text-sm text-clay capitalize">{org.plan} plan</p>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded-full ${
                    org.score >= 80 ? 'bg-green-100 text-green-700' :
                    org.score >= 50 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {org.score}/100
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="font-mono text-sm font-bold text-ink">{org.members}/{org.seats}</span>
                    <span className="text-xs text-clay ml-1">seats</span>
                  </div>
                  <div>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded ${org.sso ? 'bg-green-100 text-green-700' : 'bg-sand text-clay'}`}>
                      SSO {org.sso ? 'on' : 'off'}
                    </span>
                  </div>
                  <div>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded ${org.mfa ? 'bg-green-100 text-green-700' : 'bg-sand text-clay'}`}>
                      MFA {org.mfa ? 'required' : 'optional'}
                    </span>
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Multi-Tenant Auth?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              The moment your SaaS gets a second customer, everything breaks. Suddenly you need org-level isolation,
              role hierarchies that actually make sense, and an invite flow that doesn&apos;t leak data across tenants.
            </p>
            <p>
              Most teams bolt multi-tenancy on after the fact. The schema gets messy, the permission checks get scattered
              across the codebase, and one day someone from Org A sees Org B&apos;s data. Nobody writes a blog post about that.
            </p>
            <p className="font-medium text-ink">
              This server models six organizations across three plan tiers, with proper role hierarchies (owner → admin → manager → member → viewer),
              invite lifecycle tracking, MFA compliance monitoring, and a full audit trail. Ask a question about who has access to what &mdash;
              and get an answer backed by real permissions data, not guesswork.
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
              { label: 'Organizations', value: '6' },
              { label: 'Users', value: '18' },
              { label: 'Memberships', value: '19' },
              { label: 'Roles', value: '30' },
              { label: 'Invitations', value: '8' },
              { label: 'Audit Events', value: '25' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            Six orgs spanning enterprise, business, and starter tiers. One suspended org with a deactivated user. A freelancer
            in two orgs simultaneously. Users with MFA disabled in MFA-required orgs. Expired and revoked invitations.
            Fifteen granular permissions across five role levels. Edge cases that will actually show up in production.
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
              <code>{`cd day20-multi-tenant-auth
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Need multi-tenant auth that doesn&apos;t fall apart at scale?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If you&apos;re bolting on multi-tenancy after the fact or your permission model is a pile of if-statements, let&apos;s talk about doing it right.
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
          <p className="text-xs text-clay">Day 20 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
