import { Heart, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'search_patients', description: 'Find pets by name, owner, species, or breed' },
  { name: 'get_patient_record', description: 'Full medical record — vaccines, treatments, appointments, weight history, allergy alerts' },
  { name: 'overdue_vaccinations', description: 'Patients overdue or due soon, with owner contact info' },
  { name: 'todays_schedule', description: "Today's appointments by vet, sorted by time" },
  { name: 'search_treatments', description: 'Search by diagnosis, medication, or patient' },
  { name: 'clinic_stats', description: 'Dashboard — patient count, appointments, revenue, outstanding balance, no-show rate' },
];

const exampleQueries = [
  'Which patients are overdue for vaccinations?',
  "Pull up Biscuit's full medical record",
  "What's on Dr. Huang's schedule tomorrow?",
  'Does the Ramirez cat have any allergies?',
  'How many appointments do we have this week?',
  'Show me all patients who came in for ear infections this year',
];

export default function Day3Page() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-cream/90 backdrop-blur-md border-b border-sand/50 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono text-sm text-clay tracking-wider hover:text-terracotta transition-colors">
            30 DAYS OF CLAUDE CODE
          </Link>
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
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-clay hover:text-terracotta transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all days
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-terracotta/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">
                Day 3 &mdash; Veterinary / Healthcare
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">
                Veterinary Clinic
              </h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            The receptionist&apos;s new best friend.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that connects a vet clinic&apos;s patient records, appointments, vaccinations,
            and treatment history to Claude. No clicking through charts. Just ask.
          </p>
        </div>
      </section>

      {/* Example Queries */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">
            Example Queries
          </p>
          <div className="grid gap-3">
            {exampleQueries.map((query) => (
              <div
                key={query}
                className="p-4 bg-linen border border-sand rounded-lg font-mono text-sm text-charcoal"
              >
                &ldquo;{query}&rdquo;
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">
            Tools
          </p>
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
                    <td className="py-3 pr-6 font-mono text-sm text-terracotta whitespace-nowrap">
                      {tool.name}
                    </td>
                    <td className="py-3 text-sm text-charcoal">{tool.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why Veterinary */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">
            Why This Industry
          </p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Veterinary?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Vet clinics run on paper charts and clunky software that hasn&apos;t been updated since
              2014. The front desk juggles patient lookups, vaccination reminders, and scheduling all
              day &mdash; usually across multiple screens.
            </p>
            <p>
              This tool puts all of it behind a single question.
            </p>
            <p className="font-medium text-ink">
              Plus, who doesn&apos;t want to build something for dogs?
            </p>
          </div>
        </div>
      </section>

      {/* Data Overview */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">
            Demo Data
          </p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">What&apos;s Inside</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Patients', value: '35' },
              { label: 'Appointments', value: '82' },
              { label: 'Vaccinations', value: '82' },
              { label: 'Treatments', value: '54' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            Includes realistic edge cases: senior dog with chronic conditions (7 visits), cat with
            penicillin allergy, 3-appointment no-show pattern, puppy vaccine schedule, emergency GDV
            surgery, overweight cat on diet plan, heart murmur monitoring, and bearded dragon exotic care.
          </p>
        </div>
      </section>

      {/* Setup */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">
            Setup
          </p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Try It Locally</h2>
          <div className="bg-ink rounded-lg p-6 overflow-x-auto">
            <pre className="font-mono text-sm text-cream leading-relaxed">
              <code>{`cd day03-vet-clinic
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">
            Then add the config to Claude Desktop and restart.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">
            Want one of these for your clinic?
          </h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your front desk is still clicking through five tabs to pull up a patient chart, let&apos;s fix that.
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
            Day 3 of 30. Follow along.
          </p>
        </div>
      </footer>
    </div>
  );
}
