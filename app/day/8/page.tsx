import { ShoppingBag, Github, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const tools = [
  { name: 'product_catalog', description: 'Search products — pricing, margins, stock levels, and total sales performance' },
  { name: 'order_lookup', description: 'Find orders by number, status, customer, or date — with items, totals, and tracking' },
  { name: 'customer_insights', description: 'Customer profiles with tier, lifetime value, order count, and recency' },
  { name: 'inventory_alerts', description: 'Out-of-stock, low stock, overstocked items, and pending fulfillment count' },
  { name: 'sales_analytics', description: 'Revenue, AOV, top products, category breakdown, and order status distribution' },
  { name: 'fulfillment_queue', description: 'Orders awaiting shipment — express first, with overdue flags' },
];

const exampleQueries = [
  'What products are running low on stock?',
  'Show me all pending orders that need to ship today',
  'Who are our VIP customers and when did they last order?',
  'What\u2019s our best-selling product this month?',
  'Any orders for Maya Thompson?',
  'How are skincare sales performing compared to haircare?',
];

export default function Day8Page() {
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
              <ShoppingBag className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-mono text-xs text-terracotta tracking-wider uppercase">Day 8 &mdash; E-Commerce / Retail</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">E-Commerce Inventory &amp; Orders</h1>
            </div>
          </div>

          <p className="text-lg text-charcoal leading-relaxed max-w-2xl mb-2">
            Your Shopify dashboard, but you can talk to it.
          </p>
          <p className="text-charcoal leading-relaxed max-w-2xl">
            An MCP server that connects a DTC beauty brand&apos;s product catalog, orders, customers,
            inventory levels, and sales data to Claude. Ask about your business in plain English.
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

      {/* Why This Industry */}
      <section className="py-16 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Why This Industry</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Why E-Commerce?</h2>
          <div className="space-y-4 text-charcoal leading-relaxed">
            <p>
              DTC founders live inside dashboards. Shopify, Google Analytics, Klaviyo, ShipStation &mdash;
              the data exists, but getting a simple answer means clicking through four tabs and running a mental JOIN.
            </p>
            <p>
              &ldquo;What&apos;s our best-selling product this month?&rdquo; shouldn&apos;t require exporting a CSV.
              &ldquo;Which VIP customers haven&apos;t ordered in 60 days?&rdquo; shouldn&apos;t require a Klaviyo segment.
            </p>
            <p className="font-medium text-ink">
              This tool answers business questions, not just data questions.
            </p>
          </div>
        </div>
      </section>

      {/* Data Overview */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-sm text-terracotta tracking-wider uppercase mb-4">Demo Data</p>
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">What&apos;s Inside</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Products', value: '24' },
              { label: 'Customers', value: '20' },
              { label: 'Orders', value: '36' },
              { label: 'Categories', value: '6' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-linen border border-sand rounded-lg text-center">
                <p className="font-serif text-2xl font-bold text-ink">{stat.value}</p>
                <p className="font-mono text-xs text-clay mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-clay mt-4">
            Modeled after a DTC beauty brand (Solara). Includes VIP influencer with PR packages,
            a barbershop owner who bulk orders, a quarterly corporate gifter, out-of-stock sunscreen,
            overstocked holiday sets, a cancelled order, a refunded order (allergic reaction),
            and a TikTok-referred first-time buyer.
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
              <code>{`cd day08-ecommerce
npm install && npm run seed && npm run build`}</code>
            </pre>
          </div>
          <p className="text-sm text-charcoal mt-4">Then add the config to Claude Desktop and restart.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-4">Want one for your store?</h2>
          <p className="text-charcoal mb-8 max-w-lg mx-auto">
            If you&apos;re still exporting CSVs to answer basic business questions, let&apos;s fix that.
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
          <p className="text-xs text-clay">Day 8 of 30. Follow along.</p>
        </div>
      </footer>
    </div>
  );
}
