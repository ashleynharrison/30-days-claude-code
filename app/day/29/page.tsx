import { Stethoscope, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'patient_intake_status', description: 'Full intake view for a patient — demographics, form status, insurance verification, consents, appointments, and a readiness checklist.' },
  { name: 'new_patient_form', description: 'Create or update intake forms (new patient, annual update, specialist referral). Auto-computes clinical flags and urgent-review triggers.' },
  { name: 'insurance_verification', description: 'Track insurance across patients — verified, pending, denied, expired. Surfaces copays, deductibles, and what needs attention.' },
  { name: 'appointment_scheduler', description: 'List, schedule, confirm, or cancel appointments. Detects provider conflicts and filters by provider, type, or date range.' },
  { name: 'consent_tracker', description: 'HIPAA, treatment, telehealth, release-of-records, and financial consents. Flags patients missing required signatures and expiring documents.' },
  { name: 'intake_queue', description: 'Front-desk dashboard — urgent flags, forms awaiting review, today\'s arrivals, insurance holds, and appointments that aren\'t ready yet.' },
];

const exampleQueries = [
  'Give me the full intake status for Elena Vasquez',
  'Which patients have pending insurance verification?',
  'Show me everyone with urgent clinical flags',
  'Which upcoming appointments aren\'t ready to see the provider?',
  'Who\'s missing their HIPAA consent?',
  'What\'s on the intake queue today?',
];

export default function Day29Page() {
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
              <Stethoscope className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 29 &mdash; Custom Development</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Healthcare Patient Intake</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Paper clipboards in 2026. Really?
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that runs the entire patient intake workflow &mdash; digital forms, insurance verification,
            appointment scheduling, HIPAA consents, and a front-desk queue that knows which patients aren&apos;t
            ready to see the provider yet.
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

      {/* The System */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">The System</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Clipboard to Clinical Queue</h2>
          <p className="text-charcoal leading-relaxed mb-6">
            Every patient encounter starts with the same four things. This MCP stitches them into one workflow:
          </p>
          <div className="grid gap-4">
            {[
              { step: 'Intake', color: 'bg-blue-500', desc: 'Digital forms with auto-computed clinical flags. A specialist referral mentioning chest pain + exertion gets flagged for urgent review before the provider ever opens the chart.' },
              { step: 'Insurance', color: 'bg-emerald-500', desc: 'Verification status, copays, deductibles, termination dates. Instantly see which patients have coverage issues blocking their visit.' },
              { step: 'Consents', color: 'bg-amber-500', desc: 'HIPAA, treatment, telehealth, release-of-records. Track what\'s signed, what\'s pending, and what\'s expiring — by patient and by consent type.' },
              { step: 'Readiness', color: 'bg-purple-500', desc: 'The intake queue cross-references everything. Tomorrow\'s 9 AM appointment is not ready if insurance is pending, HIPAA isn\'t signed, or the form hasn\'t been submitted.' },
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Patient Intake?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Patient intake is the most broken process in American healthcare. Paper clipboards.
              Faxed insurance cards. Consent forms signed three times because nobody can find the last one.
              Front desk staff context-switching between five systems to confirm a single appointment.
            </p>
            <p>
              The work isn&apos;t clinical &mdash; it&apos;s coordination. Who filled out their form?
              Did insurance clear? Is HIPAA on file? Does the provider know this patient was flagged for
              chest pain? That&apos;s what this build handles: the unglamorous machinery that determines
              whether the appointment actually happens.
            </p>
            <p className="font-medium text-ink">
              One question &mdash; &ldquo;what&apos;s on the intake queue?&rdquo; &mdash; and you get the urgent flags,
              the forms awaiting review, the insurance holds, and the appointments that aren&apos;t ready yet.
              The provider walks in already knowing what they need to know.
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
              { label: 'Patients', value: '12' },
              { label: 'Intake Forms', value: '12' },
              { label: 'Insurance Records', value: '15' },
              { label: 'Appointments', value: '15' },
              { label: 'Consents', value: '29' },
              { label: 'Activity Log', value: '26' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            12 realistic patients across a wide demographic mix. Intake forms in every workflow state &mdash;
            pending, in-progress, submitted, reviewed, and completed. Clinical flags auto-computed
            (exertional cardiac symptoms, polypharmacy, skin lesion change, family cancer history).
            Insurance records across Medicare, PPO, HMO, EPO, and student plans. Consents at every
            stage including POA-signed records for geriatric patients.
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
              <code>{`cd day29-healthcare-intake
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Still running intake on paper?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If your front desk is context-switching between five systems to see a patient &mdash; let&apos;s build
            something that knows the answer before they ask.
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
          <p className="text-xs text-clay">Day 29 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
