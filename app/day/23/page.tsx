import { Component, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'list_tokens', description: 'List and search design tokens across 5 categories — colors, spacing, typography, shadows, and radii. Shows light and dark mode values with CSS variables.' },
  { name: 'list_components', description: 'List all components with variant counts, accessibility scores, status, and category. Filter by owner, status, or component type.' },
  { name: 'get_component', description: 'Deep dive into a single component — every variant with props, all accessibility checks, token dependencies, and recent changelog.' },
  { name: 'a11y_audit', description: 'Run an accessibility audit across all components or a specific one. Shows pass/fail checks, system score, and a prioritized fix list.' },
  { name: 'get_changelog', description: 'Browse the design system changelog — additions, updates, and fixes. Filter by component, author, or action type.' },
  { name: 'system_overview', description: 'High-level health check of the entire system — token coverage, component maturity, dark mode completeness, dependency graph, and team activity.' },
];

const exampleQueries = [
  'Show me all the color tokens with their dark mode values',
  'Which components have an accessibility score below 90?',
  'Give me the full breakdown of the Button component — every variant and a11y check',
  'Run an accessibility audit and show me only the failing checks',
  'What changed in the design system this week?',
  'How healthy is the overall design system? Give me the big picture.',
];

export default function Day23Page() {
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
              <Component className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 23 &mdash; UI/UX Design</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Design System Component Library</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Your Figma file says &ldquo;primary-500.&rdquo; Your CSS says &ldquo;#6366F1.&rdquo; Your Storybook says &ldquo;indigo.&rdquo; Nobody agrees.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that manages the full design system &mdash; tokens, components, variants, dark mode values, accessibility scores,
            and dependency graphs. One source of truth instead of three that disagree.
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

      {/* Components Preview */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Component Library</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">12 Components</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { name: 'Button', category: 'actions', variants: 8, score: 98, status: 'stable' },
              { name: 'Input', category: 'forms', variants: 5, score: 95, status: 'stable' },
              { name: 'Modal', category: 'overlays', variants: 4, score: 92, status: 'stable' },
              { name: 'Card', category: 'layout', variants: 4, score: 90, status: 'stable' },
              { name: 'Badge', category: 'data-display', variants: 5, score: 96, status: 'stable' },
              { name: 'Toast', category: 'feedback', variants: 4, score: 88, status: 'stable' },
              { name: 'Avatar', category: 'data-display', variants: 3, score: 94, status: 'stable' },
              { name: 'Tooltip', category: 'overlays', variants: 3, score: 91, status: 'stable' },
              { name: 'Tabs', category: 'navigation', variants: 3, score: 85, status: 'beta' },
              { name: 'DataTable', category: 'data-display', variants: 3, score: 78, status: 'beta' },
              { name: 'Select', category: 'forms', variants: 3, score: 72, status: 'draft' },
              { name: 'Skeleton', category: 'feedback', variants: 3, score: 100, status: 'draft' },
            ].map((comp) => (
              <div key={comp.name} className="p-5 bg-white border border-sand rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink">{comp.name}</h3>
                    <p className="text-xs text-clay font-mono">{comp.category}</p>
                  </div>
                  <span className={`font-mono text-xs px-2 py-1 rounded-full ${
                    comp.status === 'stable' ? 'bg-green-100 text-green-700' :
                    comp.status === 'beta' ? 'bg-amber-100 text-amber-700' :
                    'bg-neutral-100 text-neutral-600'
                  }`}>
                    {comp.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <span className="font-mono text-xs text-clay">{comp.variants} variants</span>
                  <span className={`font-mono text-xs ${comp.score >= 90 ? 'text-green-600' : comp.score >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                    a11y: {comp.score}
                  </span>
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why a Design System Library?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Design systems are supposed to be the single source of truth. In practice, they&apos;re three sources
              of partial truth &mdash; a Figma file that&apos;s sort of up to date, a Storybook that&apos;s definitely
              behind, and a CSS file that nobody trusts.
            </p>
            <p>
              The designer says &ldquo;use the primary button.&rdquo; The developer asks &ldquo;which primary button?
              There are four.&rdquo; The QA engineer files a bug because the border radius is 6px on one screen
              and 8px on another. Nobody wins.
            </p>
            <p className="font-medium text-ink">
              This server manages 47 design tokens across 5 categories, 12 components with 48 variants,
              26 accessibility checks, and a full dependency graph. Dark mode values are tracked at the token level.
              Every component has an accessibility score. Ask &ldquo;which components need attention?&rdquo; and
              get a prioritized list instead of a Slack thread.
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
              { label: 'Tokens', value: '47' },
              { label: 'Components', value: '12' },
              { label: 'Variants', value: '48' },
              { label: 'A11y Checks', value: '26' },
              { label: 'Dependencies', value: '24' },
              { label: 'Changelog', value: '16' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            Tokens span colors (primary, neutral, semantic), spacing (4px to 64px), typography (Inter + JetBrains Mono),
            shadows, and radii &mdash; all with CSS variable mappings and Figma references. Dark mode values are defined
            at the token level, not per-component. Components range from stable (Button, Input) to beta (DataTable, Tabs)
            to draft (Select, Skeleton). Accessibility checks include keyboard navigation, ARIA attributes, focus management,
            contrast ratios, and screen reader support.
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
              <code>{`cd day23-design-system
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Your design system needs a conversation layer?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your tokens live in Figma, your components live in Storybook, and your accessibility audit
            lives in a spreadsheet &mdash; let&apos;s put them all in one place.
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
          <p className="text-xs text-clay">Day 23 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
