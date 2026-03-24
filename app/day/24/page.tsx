import { MessageCircleHeart, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'review_search', description: 'Search reviews by business, source, rating, sentiment, date range, or keyword. Returns review text with sentiment scores.' },
  { name: 'sentiment_overview', description: 'Sentiment breakdown for a business — overall score, positive/neutral/negative split, average rating, and top themes driving sentiment.' },
  { name: 'theme_analysis', description: 'Analyze what customers talk about most — themes, categories, average sentiment per theme, trend direction, and sample reviews.' },
  { name: 'trend_tracker', description: 'Track sentiment over time — weekly scores, review volume, positive/negative split, and which themes are rising or falling.' },
  { name: 'competitive_sentiment', description: 'Compare sentiment across all tracked businesses — side-by-side scores, strengths, weaknesses, and rankings.' },
  { name: 'action_items', description: 'Prioritized action items based on negative themes, declining trends, and recurring complaints — with supporting review evidence.' },
];

const exampleQueries = [
  'Are our customers happy at the Grand Oak Hotel?',
  'What are people complaining about most at Saffron Kitchen?',
  'Show me the sentiment trend for Coastal Brew over the last 6 weeks',
  'Which business has the best reviews right now?',
  'What should Pulse Fitness fix first?',
  'Find all 1-star reviews that mention wait times',
];

export default function Day24Page() {
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
              <MessageCircleHeart className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 24 &mdash; ML Engineering</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">Sentiment Analysis Pipeline</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            1,000 reviews. One question: &ldquo;Are our customers happy?&rdquo;
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An ML-powered MCP server that processes customer reviews, scores sentiment, extracts recurring themes,
            and surfaces what people actually care about. Not star ratings &mdash; real patterns, real trends, real action items.
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
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">The Pipeline</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">How Sentiment Analysis Works</h2>
          <p className="text-charcoal leading-relaxed mb-6">
            Every review is processed through a multi-layer pipeline that goes beyond simple positive/negative classification:
          </p>
          <div className="grid gap-4">
            {[
              { step: 'Score', color: 'bg-emerald-500', desc: 'Each review gets a sentiment score from -1.0 (strongly negative) to +1.0 (strongly positive), with labels: positive, neutral, negative.' },
              { step: 'Extract', color: 'bg-blue-500', desc: 'Key themes are identified from review text — staff service, food quality, cleanliness, pricing, facilities — and mapped to categories.' },
              { step: 'Aggregate', color: 'bg-amber-500', desc: 'Weekly snapshots track sentiment over time, showing trends, volume changes, and which themes are driving shifts.' },
              { step: 'Prioritize', color: 'bg-red-500', desc: 'Declining themes and recurring complaints are surfaced as prioritized action items with supporting evidence from real reviews.' },
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
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why Sentiment Analysis?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              Every hospitality and retail business is sitting on a goldmine of customer feedback.
              Google Reviews, Yelp, TripAdvisor, internal surveys &mdash; hundreds of unstructured text
              entries that nobody has time to read systematically.
            </p>
            <p>
              Star ratings tell you the &ldquo;what&rdquo; but not the &ldquo;why.&rdquo; A 3-star review could mean
              &ldquo;great food, terrible service&rdquo; or &ldquo;average everything.&rdquo; The difference matters
              enormously for deciding what to fix first.
            </p>
            <p className="font-medium text-ink">
              This pipeline extracts the themes that actually drive customer satisfaction. It shows you that
              &ldquo;wait times&rdquo; appear in 6 negative reviews and the trend is getting worse &mdash;
              while &ldquo;food quality&rdquo; is your strength with a 0.88 sentiment score. Ask one question,
              get a prioritized list of what to fix and what to protect. Second ML Engineering build of the challenge.
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
              { label: 'Businesses', value: '5' },
              { label: 'Reviews', value: '66' },
              { label: 'Themes', value: '36' },
              { label: 'Snapshots', value: '26' },
              { label: 'Sources', value: '5' },
              { label: 'Weeks of Data', value: '6' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            5 businesses across hospitality, food &amp; beverage, restaurant, wellness, and resort industries.
            Reviews sourced from Google, Yelp, TripAdvisor, OpenTable, and internal surveys.
            Each business has distinct personality: strong service but aging facilities, great product
            but inconsistent quality, beloved instructors but broken booking app. Real patterns, realistic edge cases.
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
              <code>{`cd day24-sentiment-analysis
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Want to know what your customers really think?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If you&apos;re reading reviews one at a time instead of seeing the patterns, let&apos;s build something that listens at scale.
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
          <p className="text-xs text-clay">Day 24 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
