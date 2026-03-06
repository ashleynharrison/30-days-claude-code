import { Palette, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'palette_generator', description: 'Browse color palettes with hex, HSL, RGB values plus WCAG contrast ratios and accessibility compliance' },
  { name: 'typography_system', description: 'Complete type systems — font families, weights, fallback stacks, usage rules, and pairing rationale' },
  { name: 'token_export', description: 'Export design tokens as CSS custom properties, JSON, or Tailwind config — spacing, shadows, radii, colors' },
  { name: 'component_specs', description: 'Detailed component specs with properties, usage guidelines, and do/don\'t lists' },
  { name: 'brand_guidelines', description: 'Brand voice, photography direction, and logo usage rules with real do/don\'t examples' },
  { name: 'style_audit', description: 'Audit brand systems for accessibility, consistency, performance, and brand violations' },
];

const exampleQueries = [
  'Show me the color palette for Forge Labs with WCAG contrast ratios',
  'What fonts does Kindred Kitchen use and why were they paired?',
  'Export Aura Wellness design tokens as a Tailwind config',
  'What are the do\'s and don\'ts for the Vantage Advisory brand voice?',
  'Run a style audit — what accessibility issues need fixing?',
  'Show me the button component specs for all brands',
];

export default function Day11Page() {
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
              <Palette className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 11 &mdash; UI/UX Design / Creative Agencies</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Brand System Generator</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Give it a company name and a vibe. Get a full brand system &mdash; color palette, typography pairings, component tokens, and a style audit.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that generates and manages complete design systems. Query colors with WCAG
            contrast ratios, export tokens in CSS/JSON/Tailwind, and audit your brand for accessibility issues.
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

      {/* Brand Previews */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Demo Brands</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">4 Complete Brand Systems</h2>
          <div className="grid gap-4">
            {[
              { name: 'Aura Wellness', tagline: 'Breathe. Move. Restore.', industry: 'Health & Wellness', vibe: 'Calm, premium, approachable', colors: ['#7B9E87', '#4A6B54', '#C4836A', '#F5F0EB', '#2D3331', '#D4A84B'] },
              { name: 'Forge Labs', tagline: 'Ship faster. Break less.', industry: 'Developer Tools', vibe: 'Technical, confident, sharp', colors: ['#3B82F6', '#1D4ED8', '#22C55E', '#EF4444', '#0F172A', '#1E293B'] },
              { name: 'Kindred Kitchen', tagline: 'Real food. Real people.', industry: 'Food & Beverage', vibe: 'Warm, artisanal, honest', colors: ['#A3392B', '#D45B4B', '#6B7D3A', '#FDF6ED', '#2C1810', '#D4A020'] },
              { name: 'Vantage Advisory', tagline: 'Clarity at the top.', industry: 'Financial Services', vibe: 'Authoritative, refined, modern', colors: ['#1B2A4A', '#4A6FA5', '#B8860B', '#F8F6F3', '#9CA3AF', '#1F2937'] },
            ].map((brand) => (
              <div key={brand.name} className="p-6 bg-white border border-sand rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink">{brand.name}</h3>
                    <p className="text-sm text-clay italic">&ldquo;{brand.tagline}&rdquo;</p>
                  </div>
                  <span className="font-mono text-xs text-terracotta">{brand.industry}</span>
                </div>
                <p className="text-sm text-charcoal mb-3">{brand.vibe}</p>
                <div className="flex gap-1">
                  {brand.colors.map((color) => (
                    <div
                      key={color}
                      className="w-8 h-8 rounded-md border border-sand/50"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Brand Systems?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Most brand guidelines live in a PDF that nobody reads. The designer picks colors by memory, the
              developer eyeballs spacing values, and six months later the product looks nothing like the original vision.
            </p>
            <p>
              A brand system that&apos;s queryable changes the game. Need the primary button spec? Ask. Want to export
              tokens for a new project? One command. Worried about accessibility? Run the audit.
            </p>
            <p className="font-medium text-ink">
              This is the first UI/UX Design build in the challenge. It bridges the gap between design intent
              and engineering implementation &mdash; the same gap that causes 80% of design drift.
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
              { label: 'Brands', value: '4' },
              { label: 'Colors', value: '25' },
              { label: 'Type Styles', value: '12' },
              { label: 'Design Tokens', value: '42' },
              { label: 'Component Specs', value: '8' },
              { label: 'Audit Issues', value: '10' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            4 complete brand systems across wellness, developer tools, food &amp; beverage, and financial services.
            Each includes full color palettes with WCAG contrast ratios, typography pairings with rationale,
            design tokens exportable in 3 formats, component specs with do/don&apos;t lists, and brand voice guidelines.
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
              <code>{`cd day11-brand-system
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Need a brand system that actually ships?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your brand guidelines are a dusty PDF and your product looks different on every page, let&apos;s fix that.
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
          <p className="text-xs text-clay">Day 11 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
