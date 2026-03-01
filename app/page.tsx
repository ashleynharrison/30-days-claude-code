import { Scale, CreditCard, Heart, Home, UtensilsCrossed, Dumbbell, Github, Mail, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { days as daysData, TOTAL_DAYS } from './days-data';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Scale,
  CreditCard,
  Heart,
  Home,
  UtensilsCrossed,
  Dumbbell,
};

const days = daysData.map((d) => ({
  ...d,
  icon: iconMap[d.icon] || Scale,
}));

export default function HomePage() {
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
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">
            The Challenge
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-ink leading-[1.1] mb-6">
            30 Days of<br />
            <span className="text-terracotta">Claude Code</span>
          </h1>
          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-4">
            Every day for 30 days, I&apos;m building a real, functional business tool for a different
            industry &mdash; using Claude Code. No tutorials. No toy projects. Tools that a business
            could use tomorrow.
          </p>
          <p className="text-lg text-charcoal leading-relaxed max-w-2xl">
            I keep hearing &ldquo;AI will replace your job.&rdquo; I think that&apos;s backwards.
            The people who learn to build with AI will replace the people who don&apos;t.
          </p>
        </div>
      </section>

      {/* Day Cards */}
      <section className="py-20 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Progress</p>
          <h2 className="font-serif text-3xl font-bold text-ink mb-8">
            {days.length} of {TOTAL_DAYS} shipped
          </h2>
          <div className="grid gap-4">
            {days.map((day) => {
              const Icon = day.icon;
              return (
                <Link
                  key={day.day}
                  href={`/day/${day.day}`}
                  className="group flex items-start gap-5 p-6 bg-linen border border-sand rounded-xl hover:border-terracotta/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-terracotta" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs text-terracotta tracking-wider uppercase">
                        Day {day.day}
                      </span>
                      <span className="font-mono text-xs text-clay">{day.industry}</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-ink mb-1 group-hover:text-terracotta transition-colors">
                      {day.title}
                    </h3>
                    <p className="text-sm text-charcoal leading-relaxed">{day.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs font-mono text-clay">{day.tools} tools</span>
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-sage">
                        Shipped
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-sand group-hover:text-terracotta transition-colors flex-shrink-0 mt-1" />
                </Link>
              );
            })}

            {/* Placeholder for upcoming days */}
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={`upcoming-${i}`}
                className="flex items-center gap-5 p-6 border border-dashed border-sand/80 rounded-xl opacity-40"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-sand/30 flex items-center justify-center">
                  <span className="font-mono text-sm text-clay">{days.length + i + 1}</span>
                </div>
                <div>
                  <span className="font-mono text-xs text-clay tracking-wider">Day {days.length + i + 1} &mdash; Coming soon</span>
                </div>
              </div>
            ))}
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

      {/* CTA */}
      <section className="py-20 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold text-ink mb-4">
            Want one of these for your business?
          </h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If you&apos;re watching this and thinking &ldquo;I wish my data worked
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
            {days.length} of {TOTAL_DAYS} shipped. Follow along.
          </p>
        </div>
      </footer>
    </div>
  );
}
