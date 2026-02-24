import { Scale, Search, Calendar, AlertTriangle, BarChart3, Users, ExternalLink, Github, Mail, ArrowRight } from 'lucide-react';

const tools = [
  { name: 'search_cases', icon: Search, description: 'Search by client, type, status, attorney, or free text' },
  { name: 'get_case_details', icon: Scale, description: 'Full case record with tasks and client info' },
  { name: 'upcoming_hearings', icon: Calendar, description: 'All hearings within a date range' },
  { name: 'overdue_tasks', icon: AlertTriangle, description: 'Tasks past due, with case context' },
  { name: 'case_stats', icon: BarChart3, description: 'Dashboard summary across the firm' },
  { name: 'search_clients', icon: Users, description: 'Client lookup with associated cases' },
];

const exampleQueries = [
  'Which cases have hearings this week?',
  "Show me all of Maria's active immigration cases",
  'What tasks are overdue?',
  'Give me a summary of case 2025-CV-0142',
  'How many active cases does each attorney have?',
  'Find all clients with pending family law cases',
];

const techStack = [
  'TypeScript', 'MCP SDK', 'SQLite', 'better-sqlite3', 'Claude Desktop', 'Node.js',
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-cream/90 backdrop-blur-md border-b border-sand/50 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-mono text-sm text-clay tracking-wider">30 DAYS OF CLAUDE CODE</span>
          <div className="flex items-center gap-4">
            <a
              href="https://tellavsn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-charcoal hover:text-terracotta transition-colors"
            >
              tellavsn.com
            </a>
            <a
              href="https://github.com/ashleynharrison/30-days-claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-charcoal hover:text-terracotta transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">
            Day 1 of 30
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-ink leading-[1.1] mb-6">
            Legal Firm<br />
            <span className="text-terracotta">Case Manager</span>
          </h1>
          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-8">
            An MCP server that connects a legal firm&apos;s case management data to Claude.
            No dashboard to learn. No tabs to click through. Just ask.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/ashleynharrison/30-days-claude-code/tree/main/day01-legal-firm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-cream rounded-lg text-sm font-medium hover:bg-charcoal transition-colors"
            >
              <Github className="w-4 h-4" />
              View Source
            </a>
            <a
              href="#tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-sand text-charcoal rounded-lg text-sm font-medium hover:border-terracotta hover:text-terracotta transition-colors"
            >
              Explore Tools
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* The Challenge */}
      <section className="py-20 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">The Challenge</p>
          <h2 className="font-serif text-3xl font-bold text-ink mb-6">
            30 tools. 30 industries. 30 days.
          </h2>
          <div className="prose prose-charcoal max-w-none">
            <p className="text-charcoal leading-relaxed mb-4">
              Every day for 30 days, I&apos;m building a real, functional business tool for a different
              industry &mdash; using Claude Code. No tutorials. No toy projects. Tools that a business
              could use tomorrow.
            </p>
            <p className="text-charcoal leading-relaxed">
              I keep hearing &ldquo;AI will replace your job.&rdquo; I think that&apos;s backwards.
              The people who learn to build with AI will replace the people who don&apos;t.
              This challenge is me proving that out &mdash; publicly.
            </p>
          </div>
        </div>
      </section>

      {/* Who's Building */}
      <section className="py-20 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Who&apos;s Building This</p>
          <h2 className="font-serif text-3xl font-bold text-ink mb-6">Ashley Harrison</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Operations professional with 13+ years of experience, currently working as a Program
              Specialist at Webflow. On the side, I run{' '}
              <a href="https://tellavsn.com" className="text-terracotta hover:underline" target="_blank" rel="noopener noreferrer">
                Tell a Vsn
              </a>
              {' '}&mdash; a design and technology consultancy specializing in MCP integrations, AI engineering,
              custom development, and UI/UX design.
            </p>
            <p>
              I don&apos;t come from a traditional engineering background &mdash; I taught myself to read,
              understand, and work with code through FreeCodeCamp (4 certifications) and by building real
              things with AI tools. I learn fast, I grasp technical concepts quickly, and I close the gap
              between &ldquo;I get what this does&rdquo; and &ldquo;I shipped it&rdquo; faster than most
              people expect.
            </p>
            <p>
              Before tech, I coordinated legal intake across three units at an immigration law firm
              in Los Angeles, managed client accounts at a medical-legal company, and streamlined
              scheduling operations at a court reporting firm. I&apos;ve spent my career at the intersection of people, process,
              and systems &mdash; and now I build the tools that connect all three.
            </p>
          </div>
        </div>
      </section>

      {/* Why Legal */}
      <section className="py-20 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Why Legal?</p>
          <h2 className="font-serif text-3xl font-bold text-ink mb-6">Built from experience</h2>
          <p className="text-charcoal leading-relaxed">
            Before tech, I worked at an immigration law firm in Los Angeles, coordinating intake across
            three legal units &mdash; immigration, family law, and civil cases. I&apos;ve seen firsthand
            how much time gets lost digging through case files for basic status updates. This tool makes
            that a one-sentence question.
          </p>
        </div>
      </section>

      {/* Example Queries */}
      <section className="py-20 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Talk to Your Cases</p>
          <h2 className="font-serif text-3xl font-bold text-ink mb-8">Example queries</h2>
          <div className="grid gap-3">
            {exampleQueries.map((query) => (
              <div
                key={query}
                className="flex items-center gap-3 px-5 py-3.5 bg-cream border border-sand rounded-xl"
              >
                <span className="text-terracotta text-lg">&ldquo;</span>
                <span className="text-charcoal text-sm">{query}</span>
                <span className="text-terracotta text-lg">&rdquo;</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="py-20 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">MCP Tools</p>
          <h2 className="font-serif text-3xl font-bold text-ink mb-8">6 tools, infinite questions</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.name}
                  className="p-5 bg-cream border border-sand rounded-xl hover:border-terracotta/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-terracotta/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-terracotta" />
                    </div>
                    <code className="text-sm font-mono text-ink">{tool.name}</code>
                  </div>
                  <p className="text-sm text-charcoal">{tool.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">The Stack</p>
          <h2 className="font-serif text-3xl font-bold text-ink mb-8">Built with</h2>
          <div className="flex flex-wrap gap-3">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-cream border border-sand rounded-lg text-sm text-charcoal font-mono"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold text-ink mb-4">
            Want this for your firm?
          </h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If you&apos;re a business owner watching this and thinking &ldquo;I wish my data worked
            like that&rdquo; &mdash; that&apos;s the point. Let&apos;s talk.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:ashley@tellavsn.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta/90 transition-colors"
            >
              <Mail className="w-4 h-4" />
              ashley@tellavsn.com
            </a>
            <a
              href="https://tellavsn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-sand text-charcoal rounded-lg font-medium hover:border-terracotta hover:text-terracotta transition-colors"
            >
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
          <p className="text-xs text-clay">
            Day 1 of 30. Follow along.
          </p>
        </div>
      </footer>
    </div>
  );
}
