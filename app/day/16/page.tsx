import { GitBranch, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'build_status', description: 'Get recent build status across all projects or for a specific project. Shows pass/fail, duration, author, and commit info.' },
  { name: 'deploy_history', description: 'View deployment history across projects. Shows version, environment, status, and rollbacks.' },
  { name: 'pipeline_health', description: 'Health summary for each project — success rate, average build time, last build status, and failure trends.' },
  { name: 'build_details', description: 'Detailed breakdown of a specific build — all stages with durations, statuses, and error logs.' },
  { name: 'uptime_report', description: 'Uptime and response time report for deployed services. Shows availability percentage and any incidents.' },
  { name: 'dashboard_summary', description: 'Executive overview — total projects, success rates, deploy frequency, active incidents, and team activity.' },
];

const exampleQueries = [
  'Is the build broken on any project right now?',
  'Show me the failure rate for the mobile app over the last two weeks',
  'What was the last deployment to production for the API server?',
  'Which team has the most build failures?',
  'Is auth-service healthy? Any recent downtime?',
  'Give me the full CI/CD dashboard summary',
];

export default function Day16Page() {
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
              <GitBranch className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 16 &mdash; DevOps</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">CI/CD Status Dashboard</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            &ldquo;Is the build broken?&rdquo; shouldn&apos;t require opening 4 tabs.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that tracks build status, deployment history, test results, and uptime across
            every project on your team. One question instead of four dashboards.
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

      {/* What It Covers */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Coverage</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">What the Dashboard Tracks</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { area: 'Build Status', desc: 'Pass/fail across all projects, commit info, authors, and build times' },
              { area: 'Pipeline Health', desc: 'Success rates, average duration, failure trends, and team breakdowns' },
              { area: 'Deployments', desc: 'Version history, environments, rollbacks, and deploy frequency' },
              { area: 'Uptime Monitoring', desc: 'Availability percentages, response times, and incident detection' },
              { area: 'Build Stages', desc: 'Stage-by-stage breakdown with error logs for failed builds' },
              { area: 'Team Activity', desc: 'Which teams are shipping, which are stuck, and where bottlenecks live' },
            ].map((item) => (
              <div key={item.area} className="p-5 bg-white border border-sand rounded-xl">
                <h3 className="font-serif text-lg font-bold text-ink mb-2">{item.area}</h3>
                <p className="text-sm text-charcoal">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Build */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Why This Build</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why CI/CD Visibility?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Engineering teams live in CI/CD. But the tools that run their pipelines &mdash; GitHub Actions,
              CircleCI, Jenkins &mdash; show you one repo at a time. If you manage 5 services, that&apos;s
              5 tabs. If you manage 20, good luck.
            </p>
            <p>
              The real questions aren&apos;t &ldquo;did this one build pass?&rdquo; &mdash; they&apos;re
              &ldquo;is anything broken right now?&rdquo;, &ldquo;which team has the most failures this week?&rdquo;,
              and &ldquo;when was the last production deploy for auth?&rdquo;
            </p>
            <p className="font-medium text-ink">
              This dashboard consolidates builds, deploys, and uptime into one queryable interface. Instead
              of clicking through dashboards, just ask. First DevOps build of the challenge.
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
              { label: 'Projects', value: '8' },
              { label: 'Pipelines', value: '14' },
              { label: 'Builds', value: '61' },
              { label: 'Deployments', value: '13' },
              { label: 'Uptime Checks', value: '245' },
              { label: 'Teams', value: '5' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            8 projects across 5 teams (Frontend, Backend, Mobile, Data, Platform) with 14 days of build history.
            Includes a flaky mobile test suite, a recent auth-service outage with rollback, a currently-running
            build, slow data pipeline builds, and mixed deployment environments. Edge cases: failed deploys,
            rollbacks, and a 90-minute brief service outage.
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
              <code>{`cd day16-cicd-dashboard
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Want visibility across your entire pipeline?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your engineering team is tab-switching between GitHub, Vercel, and Datadog just to answer
            &ldquo;is anything broken?&rdquo; &mdash; there&apos;s a better way.
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
          <p className="text-xs text-clay">Day 16 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
