import { Cpu, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'evaluate_technology', description: 'Deep evaluation of a specific technology — scores across 12 criteria, strengths, weaknesses, and best-fit pairings.' },
  { name: 'compare_technologies', description: 'Head-to-head comparison of 2–5 technologies — weighted scores, per-criteria winners, and an overall recommendation.' },
  { name: 'recommend_stack', description: 'Full-stack recommendation based on team size, budget, timeline, and priority — returns the best pick for each layer.' },
  { name: 'check_compatibility', description: 'Check how well technologies work together — integration scores, friction points, and missing stack layers.' },
  { name: 'analyze_project', description: 'Analyze sample projects with real constraints — see recommended stacks, rationale, and tradeoffs for FinTech, Healthcare, E-Commerce, and more.' },
  { name: 'tech_search', description: 'Search and filter technologies by category, maturity, learning curve, license, or GitHub stars.' },
];

const exampleQueries = [
  'Should we use Next.js or Remix for our new SaaS product?',
  'Recommend a stack for a 3-person team shipping an MVP in 8 weeks',
  'How well do Supabase, Next.js, and Clerk work together?',
  'What are the tradeoffs between PostgreSQL and MongoDB for e-commerce?',
  'Show me all frontend frameworks ranked by developer experience',
  'Analyze the HealthBridge enterprise project — what stack would you pick?',
];

export default function Day26Page() {
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
              <Cpu className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 26 &mdash; Digital Strategy</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Tech Stack Decision Engine</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            &ldquo;Should we use Next.js or Remix?&rdquo; is never actually about Next.js or Remix.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that weighs team size, budget, timeline, and goals &mdash; then recommends a stack with receipts.
            32 technologies scored across 12 criteria, with compatibility data and real-world project analysis.
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
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">The Engine</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">How Decisions Get Made</h2>
          <p className="text-charcoal leading-relaxed mb-6">
            Every technology is scored against 12 weighted criteria. Your constraints &mdash; team size, budget, timeline &mdash; adjust those weights to surface the right answer for your situation:
          </p>
          <div className="grid gap-4">
            {[
              { step: 'Score', color: 'bg-blue-500', desc: '32 technologies rated across 12 criteria — performance, scalability, DX, type safety, learning curve, hiring pool, community, docs, maintenance cost, time to market, hosting cost, and vendor lock-in.' },
              { step: 'Weight', color: 'bg-emerald-500', desc: 'Your constraints shift the weights. Small team? Learning curve and DX matter more. Enterprise? Scalability and type safety get boosted.' },
              { step: 'Match', color: 'bg-amber-500', desc: 'Technologies are ranked per-category with compatibility checks — ensuring your frontend, backend, database, and hosting all play well together.' },
              { step: 'Decide', color: 'bg-purple-500', desc: 'Get a full-stack recommendation with rationale and tradeoffs. Compare alternatives side by side. Ship with confidence.' },
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why a Tech Stack Decision Engine?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Every startup and every agency has the same meeting: &ldquo;What should we build this on?&rdquo;
              The answer usually comes from whoever&apos;s loudest, not from data. Frameworks get picked because
              the CTO used them at their last job, not because they fit the constraints.
            </p>
            <p>
              The real question is never &ldquo;which framework is best&rdquo; &mdash; it&apos;s &ldquo;which framework
              is best for this team, this budget, this timeline, and this goal?&rdquo; A 3-person team
              shipping in 8 weeks needs a different stack than a 15-person team building for HIPAA compliance.
            </p>
            <p className="font-medium text-ink">
              This tool makes those tradeoffs explicit. Ask a question about your stack, get an answer
              backed by scores, compatibility data, and real-world project analysis. Second Digital Strategy build of the challenge.
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
              { label: 'Technologies', value: '32' },
              { label: 'Categories', value: '6' },
              { label: 'Criteria', value: '12' },
              { label: 'Scores', value: '384' },
              { label: 'Projects', value: '4' },
              { label: 'Recommendations', value: '22' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            32 technologies across frontend (Next.js, Remix, SvelteKit, Astro, Nuxt, Angular), backend (Express, Fastify,
            NestJS, Django, FastAPI, Rails), databases (PostgreSQL, MySQL, MongoDB, Supabase, PlanetScale, Redis),
            hosting (Vercel, AWS, Fly.io, Railway, Render, Cloudflare Workers), auth (Clerk, Auth.js, Supabase Auth,
            Firebase Auth), and styling (Tailwind, CSS Modules, Styled Components, shadcn/ui). 4 sample projects
            from FinTech MVP to enterprise healthcare with full stack recommendations.
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
              <code>{`cd day26-tech-stack
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Need help choosing the right stack for your project?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your team is stuck in a framework debate instead of shipping, let&apos;s turn that conversation into a decision.
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
          <p className="text-xs text-clay">Day 26 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
