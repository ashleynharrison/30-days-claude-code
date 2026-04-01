import db from './database.js';

// Clear existing data
db.exec('DELETE FROM compatibility');
db.exec('DELETE FROM recommendations');
db.exec('DELETE FROM projects');
db.exec('DELETE FROM scores');
db.exec('DELETE FROM criteria');
db.exec('DELETE FROM technologies');

// --- Technologies ---
const insertTech = db.prepare(`INSERT INTO technologies (name, category, subcategory, license, maturity, learning_curve, community_size, github_stars, weekly_npm_downloads, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

// Frontend Frameworks
insertTech.run('Next.js', 'frontend', 'framework', 'MIT', 'stable', 'medium', 'very-large', 128000, 6200000, 'Full-stack React framework with SSR, SSG, and API routes');
insertTech.run('Remix', 'frontend', 'framework', 'MIT', 'stable', 'medium', 'large', 30000, 320000, 'Full-stack web framework focused on web standards and progressive enhancement');
insertTech.run('Nuxt', 'frontend', 'framework', 'MIT', 'stable', 'medium', 'large', 55000, 1400000, 'Vue-based full-stack framework with SSR and auto-imports');
insertTech.run('SvelteKit', 'frontend', 'framework', 'MIT', 'stable', 'low', 'medium', 19000, 280000, 'Svelte-based framework with minimal boilerplate and excellent performance');
insertTech.run('Astro', 'frontend', 'framework', 'MIT', 'stable', 'low', 'medium', 48000, 520000, 'Content-focused framework with island architecture and zero JS by default');
insertTech.run('Angular', 'frontend', 'framework', 'MIT', 'mature', 'high', 'very-large', 96000, 3200000, 'Enterprise-grade framework with batteries included — TypeScript-first');

// Backend Frameworks
insertTech.run('Express', 'backend', 'framework', 'MIT', 'mature', 'low', 'very-large', 65000, 28000000, 'Minimal Node.js web framework — the de facto standard for REST APIs');
insertTech.run('Fastify', 'backend', 'framework', 'MIT', 'stable', 'medium', 'large', 33000, 2100000, 'High-performance Node.js framework with schema validation and plugin system');
insertTech.run('NestJS', 'backend', 'framework', 'MIT', 'stable', 'high', 'large', 68000, 3400000, 'Enterprise Node.js framework inspired by Angular — modular, testable, scalable');
insertTech.run('Django', 'backend', 'framework', 'BSD', 'mature', 'medium', 'very-large', 81000, 0, 'Python full-stack framework with ORM, admin, and auth built in');
insertTech.run('FastAPI', 'backend', 'framework', 'MIT', 'stable', 'low', 'large', 79000, 0, 'Modern Python API framework with automatic OpenAPI docs and type hints');
insertTech.run('Rails', 'backend', 'framework', 'MIT', 'mature', 'medium', 'large', 56000, 0, 'Ruby convention-over-configuration framework — ship fast with less code');

// Databases
insertTech.run('PostgreSQL', 'database', 'relational', 'PostgreSQL', 'mature', 'medium', 'very-large', 0, 0, 'Advanced open-source relational database with JSON, full-text search, and extensions');
insertTech.run('MySQL', 'database', 'relational', 'GPL', 'mature', 'low', 'very-large', 0, 0, 'Most widely deployed open-source relational database');
insertTech.run('MongoDB', 'database', 'document', 'SSPL', 'mature', 'low', 'very-large', 27000, 1800000, 'Document database for flexible schemas and horizontal scaling');
insertTech.run('Supabase', 'database', 'baas', 'Apache-2.0', 'stable', 'low', 'large', 74000, 320000, 'Open-source Firebase alternative built on PostgreSQL with auth, storage, and realtime');
insertTech.run('PlanetScale', 'database', 'managed', 'proprietary', 'stable', 'low', 'medium', 0, 85000, 'Serverless MySQL platform with branching and zero-downtime schema changes');
insertTech.run('Redis', 'database', 'cache', 'BSD', 'mature', 'low', 'very-large', 67000, 4200000, 'In-memory data store for caching, sessions, queues, and real-time features');

// Hosting / Deployment
insertTech.run('Vercel', 'hosting', 'platform', 'proprietary', 'stable', 'low', 'large', 0, 0, 'Edge-first platform optimized for Next.js — preview deploys, analytics, and serverless');
insertTech.run('AWS', 'hosting', 'cloud', 'proprietary', 'mature', 'high', 'very-large', 0, 0, 'Full cloud platform — compute, storage, networking, AI, and 200+ services');
insertTech.run('Fly.io', 'hosting', 'platform', 'proprietary', 'stable', 'medium', 'medium', 0, 0, 'Deploy apps close to users with global edge compute and built-in Postgres');
insertTech.run('Railway', 'hosting', 'platform', 'proprietary', 'stable', 'low', 'medium', 0, 0, 'Deploy anything from GitHub — Postgres, Redis, and cron included');
insertTech.run('Render', 'hosting', 'platform', 'proprietary', 'stable', 'low', 'medium', 0, 0, 'Simple cloud hosting for web apps, APIs, databases, and background workers');
insertTech.run('Cloudflare Workers', 'hosting', 'edge', 'proprietary', 'stable', 'medium', 'large', 0, 0, 'Edge-deployed serverless functions with KV, Durable Objects, and R2 storage');

// Auth
insertTech.run('Clerk', 'auth', 'service', 'proprietary', 'stable', 'low', 'medium', 0, 340000, 'Drop-in auth with pre-built components, social login, MFA, and org management');
insertTech.run('Auth.js', 'auth', 'library', 'ISC', 'stable', 'medium', 'large', 24000, 820000, 'Flexible authentication for Next.js and other frameworks — self-hosted');
insertTech.run('Supabase Auth', 'auth', 'service', 'Apache-2.0', 'stable', 'low', 'large', 0, 0, 'PostgreSQL-native auth with RLS, social providers, and magic links');
insertTech.run('Firebase Auth', 'auth', 'service', 'proprietary', 'mature', 'low', 'very-large', 0, 0, 'Google-backed auth with social login, phone auth, and anonymous users');

// CSS / Styling
insertTech.run('Tailwind CSS', 'styling', 'utility', 'MIT', 'stable', 'medium', 'very-large', 84000, 9500000, 'Utility-first CSS framework — ship fast without leaving your markup');
insertTech.run('CSS Modules', 'styling', 'scoped', 'MIT', 'mature', 'low', 'very-large', 0, 0, 'Scoped CSS with zero runtime cost — built into Next.js and most bundlers');
insertTech.run('Styled Components', 'styling', 'css-in-js', 'MIT', 'mature', 'medium', 'large', 40000, 3600000, 'CSS-in-JS with tagged template literals — dynamic styles in component scope');
insertTech.run('shadcn/ui', 'styling', 'components', 'MIT', 'stable', 'low', 'large', 76000, 180000, 'Copy-paste component library built on Radix + Tailwind — own your components');

// --- Criteria ---
const insertCriteria = db.prepare('INSERT INTO criteria (name, category, description, default_weight) VALUES (?, ?, ?, ?)');

insertCriteria.run('performance', 'technical', 'Runtime performance, bundle size, and time to interactive', 1.0);
insertCriteria.run('scalability', 'technical', 'Ability to handle growth in users, data, and team size', 0.9);
insertCriteria.run('developer_experience', 'technical', 'Developer productivity, tooling, and debugging experience', 1.0);
insertCriteria.run('type_safety', 'technical', 'TypeScript support and type safety guarantees', 0.8);
insertCriteria.run('learning_curve', 'team', 'Time for a new developer to become productive', 0.7);
insertCriteria.run('hiring_pool', 'team', 'Availability of developers with experience in this technology', 0.8);
insertCriteria.run('community_ecosystem', 'ecosystem', 'Size and quality of community, plugins, and third-party integrations', 0.9);
insertCriteria.run('documentation', 'ecosystem', 'Quality, completeness, and currency of official documentation', 0.7);
insertCriteria.run('maintenance_cost', 'business', 'Long-term cost of updates, security patches, and version migrations', 0.8);
insertCriteria.run('time_to_market', 'business', 'Speed of initial development and feature iteration', 0.9);
insertCriteria.run('hosting_cost', 'business', 'Infrastructure and platform costs at scale', 0.6);
insertCriteria.run('vendor_lock_in', 'business', 'Risk of dependency on a single vendor or platform', 0.5);

// --- Scores (technology × criteria) ---
const insertScore = db.prepare('INSERT INTO scores (technology_id, criteria_id, score, notes) VALUES (?, ?, ?, ?)');

// Helper: score a technology across all 12 criteria
function scoreTech(techId: number, scores: [number, string | null][]) {
  scores.forEach(([score, notes], i) => {
    insertScore.run(techId, i + 1, score, notes);
  });
}

// Frontend Frameworks (IDs 1-6)
// [performance, scalability, dx, type_safety, learning_curve, hiring_pool, community, docs, maintenance, time_to_market, hosting_cost, vendor_lock_in]
scoreTech(1, [ // Next.js
  [8.5, 'RSC and SSR excellent; bundle size can grow'], [9.0, 'Proven at scale with Vercel, Netflix, Notion'], [9.0, 'Fast refresh, great error messages, file-based routing'],
  [9.0, 'TypeScript-first with excellent inference'], [7.0, 'App Router added complexity'], [9.5, 'Largest React hiring pool'],
  [9.5, 'Massive ecosystem, hundreds of examples'], [8.5, 'Good docs but App Router transition incomplete'], [7.5, 'Frequent breaking changes between majors'],
  [9.0, 'Fastest path from idea to deployed app'], [7.0, 'Free tier generous; serverless costs at scale'], [6.0, 'Strong Vercel optimization but deployable anywhere'],
]);
scoreTech(2, [ // Remix
  [9.0, 'Progressive enhancement, smaller bundles'], [8.0, 'Solid but smaller deployment ecosystem'], [8.5, 'Web-standard APIs, great form handling'],
  [8.5, 'TypeScript-first'], [7.5, 'Simpler mental model than Next.js App Router'], [6.5, 'Smaller hiring pool'],
  [7.0, 'Growing community, fewer examples'], [8.0, 'Excellent tutorials, smaller reference'], [8.0, 'Stable API, fewer breaking changes'],
  [8.0, 'Good but fewer starter templates'], [8.5, 'Runs anywhere Node runs'], [9.0, 'No vendor lock-in, web standards'],
]);
scoreTech(3, [ // Nuxt
  [8.0, 'Nitro engine fast; Vue reactivity efficient'], [8.0, 'Vue 3 composition API scales well'], [8.5, 'Auto-imports, great DX out of box'],
  [8.0, 'Good TypeScript support in Vue 3'], [7.0, 'Vue learning curve plus Nuxt conventions'], [6.0, 'Vue hiring pool smaller than React'],
  [8.0, 'Strong Vue ecosystem'], [8.5, 'Excellent documentation'], [8.0, 'Stable release cadence'],
  [8.5, 'Rapid prototyping with auto-imports'], [8.0, 'Flexible deployment targets'], [8.5, 'No platform lock-in'],
]);
scoreTech(4, [ // SvelteKit
  [9.5, 'Compiled output, smallest bundle sizes'], [7.0, 'Newer ecosystem, fewer scaling case studies'], [9.0, 'Minimal boilerplate, intuitive reactivity'],
  [8.0, 'TypeScript support good, not as deep as React'], [9.0, 'Easiest to learn of all frameworks'], [5.0, 'Small hiring pool'],
  [6.5, 'Growing fast but limited plugins'], [8.0, 'Interactive tutorials, smaller reference'], [8.5, 'Stable API, backward compatible'],
  [8.5, 'Very fast to prototype'], [8.5, 'Efficient, low resource usage'], [9.0, 'Adapter system, deploy anywhere'],
]);
scoreTech(5, [ // Astro
  [9.5, 'Zero JS by default, island hydration'], [6.5, 'Best for content sites, not SPAs'], [8.5, 'Simple, clean DX'],
  [8.0, 'TypeScript support solid'], [8.5, 'Simple mental model'], [4.5, 'Very small hiring pool'],
  [7.0, 'Growing, good integrations'], [9.0, 'Excellent beginner docs'], [8.5, 'Stable, backward compatible'],
  [9.0, 'Fastest for content/marketing sites'], [9.5, 'Static = cheapest hosting'], [9.0, 'Deploy anywhere, no lock-in'],
]);
scoreTech(6, [ // Angular
  [7.5, 'Heavier runtime, good with AOT'], [9.5, 'Enterprise-proven at massive scale'], [7.0, 'Powerful but verbose, steep ramp-up'],
  [9.5, 'TypeScript mandatory, excellent DI'], [5.0, 'Steepest learning curve'], [8.0, 'Large enterprise hiring pool'],
  [8.5, 'Enterprise ecosystem, Material components'], [8.0, 'Comprehensive but dense'], [7.0, 'Major version upgrades can be painful'],
  [6.5, 'Slower initial velocity'], [7.5, 'Standard hosting costs'], [8.0, 'No vendor lock-in'],
]);

// Backend Frameworks (IDs 7-12)
scoreTech(7, [ // Express
  [7.0, 'Fast enough, no built-in optimization'], [7.0, 'Scales with discipline, minimal structure'], [7.5, 'Simple but DIY for everything'],
  [6.0, 'No built-in types, needs @types'], [9.0, 'Minimal API, easy to learn'], [9.5, 'Nearly universal Node experience'],
  [9.5, 'Largest middleware ecosystem'], [7.0, 'Minimal official docs'], [6.5, 'Unmaintained periods, security concerns'],
  [8.5, 'Fastest to get a route working'], [8.0, 'Runs anywhere'], [9.5, 'Zero lock-in'],
]);
scoreTech(8, [ // Fastify
  [9.5, 'Fastest Node.js framework by benchmarks'], [8.5, 'Plugin architecture scales well'], [8.0, 'Schema validation, good logging'],
  [8.0, 'TypeScript-first plugin types'], [7.0, 'Plugin system has a learning curve'], [6.0, 'Smaller hiring pool than Express'],
  [7.5, 'Good plugin ecosystem'], [8.0, 'Well-documented'], [8.5, 'Stable, well-maintained'],
  [7.5, 'Slightly slower start than Express'], [8.0, 'Efficient resource usage'], [9.5, 'Zero lock-in'],
]);
scoreTech(9, [ // NestJS
  [8.0, 'Good with Fastify adapter'], [9.0, 'Modular architecture for large teams'], [8.0, 'Great structure, verbose decorators'],
  [9.5, 'TypeScript-first, DI, decorators'], [6.0, 'Angular-like patterns need study'], [7.5, 'Growing enterprise adoption'],
  [8.0, 'Good ecosystem of modules'], [9.0, 'Excellent comprehensive docs'], [8.0, 'Regular updates, good backward compat'],
  [7.0, 'More boilerplate upfront'], [7.5, 'Standard Node costs'], [8.5, 'Adapter pattern reduces lock-in'],
]);
scoreTech(10, [ // Django
  [7.5, 'Good with caching, slower than Go/Rust'], [9.0, 'Instagram, Spotify scale'], [8.5, 'Batteries included, admin for free'],
  [6.0, 'Python typing optional, improving'], [7.0, 'Full framework to learn'], [8.0, 'Large Python developer pool'],
  [9.0, 'Massive ecosystem of packages'], [9.5, 'Gold standard documentation'], [7.5, 'Major version migrations can be complex'],
  [8.5, 'Admin + ORM = fast prototyping'], [7.5, 'Standard hosting'], [9.0, 'No vendor lock-in'],
]);
scoreTech(11, [ // FastAPI
  [9.0, 'Async, high throughput for Python'], [8.0, 'Good for APIs, less for monoliths'], [9.0, 'Auto docs, great error messages'],
  [9.0, 'Pydantic models, full type coverage'], [8.5, 'Minimal API, easy to learn'], [7.5, 'Python pool, growing FastAPI adoption'],
  [7.5, 'Newer ecosystem, growing fast'], [8.5, 'Excellent interactive docs'], [8.5, 'Stable, well-maintained'],
  [9.0, 'Fastest Python API framework to start'], [7.5, 'Standard Python hosting'], [9.5, 'ASGI standard, zero lock-in'],
]);
scoreTech(12, [ // Rails
  [7.0, 'Ruby slower but Hotwire reduces JS need'], [8.0, 'Shopify, GitHub scale'], [9.0, 'Convention over configuration, joy to use'],
  [5.0, 'Ruby typing improving but optional'], [7.0, 'Lots of conventions to learn'], [6.0, 'Smaller Ruby hiring pool'],
  [8.5, 'Mature gem ecosystem'], [8.0, 'Great guides'], [7.0, 'Major versions can break things'],
  [9.5, 'Fastest framework to ship an MVP'], [7.5, 'Standard hosting'], [9.0, 'No lock-in'],
]);

// Databases (IDs 13-18)
scoreTech(13, [ // PostgreSQL
  [9.0, 'Excellent query optimizer'], [9.5, 'Scales to billions of rows'], [8.0, 'Powerful but complex features'],
  [7.0, 'Type system in SQL, not app-level'], [6.5, 'Advanced features have learning curve'], [9.0, 'Universal database skill'],
  [9.5, 'Extensions, PostGIS, pgvector'], [9.0, 'Comprehensive documentation'], [8.0, 'Stable, long-term support'],
  [7.0, 'Schema setup takes time'], [7.5, 'Managed options vary in cost'], [9.0, 'Available everywhere'],
]);
scoreTech(14, [ // MySQL
  [8.0, 'Fast reads, good with InnoDB'], [8.5, 'Proven at massive scale'], [7.0, 'Simpler than Postgres, fewer features'],
  [6.0, 'Basic type system'], [8.0, 'Simpler to learn than Postgres'], [9.0, 'Most common database skill'],
  [9.0, 'Mature ecosystem'], [8.0, 'Good documentation'], [7.5, 'Oracle ownership concerns'],
  [8.0, 'Fast to set up'], [7.5, 'Cheap managed options'], [8.5, 'Available everywhere'],
]);
scoreTech(15, [ // MongoDB
  [8.0, 'Fast reads for document patterns'], [8.0, 'Horizontal scaling with sharding'], [8.0, 'Flexible schemas, fast iteration'],
  [6.5, 'Mongoose adds some type safety'], [8.5, 'Easy to start, hard to optimize'], [8.0, 'Common skill'],
  [8.0, 'Atlas, Compass, good tooling'], [7.5, 'Documentation adequate'], [7.0, 'SSPL license concerns'],
  [9.0, 'No schema migration needed to start'], [6.5, 'Atlas pricing at scale'], [6.0, 'Atlas lock-in risk'],
]);
scoreTech(16, [ // Supabase
  [8.5, 'PostgreSQL performance plus edge functions'], [8.0, 'Scales with Postgres, managed for you'], [9.0, 'Dashboard, auto-generated APIs, realtime'],
  [8.0, 'Generated types from schema'], [9.0, 'Easiest database to start with'], [7.0, 'Growing adoption'],
  [8.0, 'Active community, growing integrations'], [8.5, 'Excellent guides and examples'], [8.0, 'Managed service, less ops burden'],
  [9.5, 'Fastest from zero to working API'], [8.0, 'Generous free tier'], [7.0, 'Self-hostable but some features are platform-tied'],
]);
scoreTech(17, [ // PlanetScale
  [9.0, 'Vitess-based, horizontally scalable MySQL'], [9.5, 'Built on Vitess, YouTube scale'], [8.0, 'Branching, deploy requests'],
  [7.0, 'Standard MySQL types'], [7.5, 'MySQL knowledge plus branching workflow'], [7.0, 'MySQL developers can ramp fast'],
  [6.5, 'Smaller community than Supabase'], [7.5, 'Good docs for the platform'], [8.5, 'Fully managed, zero ops'],
  [8.0, 'Quick setup with branching'], [7.0, 'Free tier limited, enterprise pricing'], [5.0, 'Proprietary platform'],
]);
scoreTech(18, [ // Redis
  [10.0, 'In-memory, microsecond latency'], [8.0, 'Redis Cluster for horizontal scaling'], [8.0, 'Simple API, powerful commands'],
  [7.0, 'ioredis has good types'], [8.0, 'Key-value simple to learn'], [9.0, 'Universal caching skill'],
  [9.0, 'Massive ecosystem'], [8.0, 'Good documentation'], [7.5, 'License changed to SSPL-like'],
  [8.0, 'Fast to add caching layer'], [7.5, 'Managed options affordable'], [8.0, 'Available everywhere'],
]);

// Hosting (IDs 19-24)
scoreTech(19, [ // Vercel
  [9.5, 'Edge network, excellent performance'], [8.0, 'Scales automatically'], [9.5, 'Best DX — git push to deploy'],
  [8.0, 'TypeScript supported'], [9.5, 'Easiest platform to learn'], [8.0, null],
  [8.5, 'Next.js ecosystem'], [9.0, 'Excellent docs and examples'], [9.0, 'Zero ops burden'],
  [9.5, 'Fastest deploy experience'], [6.0, 'Expensive at scale for serverless'], [5.0, 'Next.js optimizations are Vercel-specific'],
]);
scoreTech(20, [ // AWS
  [9.0, 'Any performance target achievable'], [10.0, 'Limitless scale'], [5.0, 'Complex console, steep learning curve'],
  [7.0, 'CDK has TypeScript'], [3.0, 'Steepest learning curve in cloud'], [9.0, 'AWS skills highly in-demand'],
  [10.0, 'Largest cloud ecosystem'], [7.0, 'Documentation exists but overwhelming'], [6.0, 'Complex to maintain, many services to manage'],
  [5.0, 'Slow initial setup'], [7.0, 'Pay for what you use, hard to predict'], [4.0, 'Significant lock-in with proprietary services'],
]);
scoreTech(21, [ // Fly.io
  [9.0, 'Global edge, fast cold starts'], [8.0, 'Multi-region by default'], [8.0, 'CLI-first, Dockerfile deploys'],
  [7.0, null], [7.5, 'Docker knowledge helpful'], [5.5, 'Smaller platform'],
  [6.5, 'Niche but passionate community'], [7.5, 'Good guides'], [7.5, 'Some manual ops still needed'],
  [8.0, 'Deploy in minutes with flyctl'], [8.0, 'Competitive pricing'], [7.5, 'Container-based, portable'],
]);
scoreTech(22, [ // Railway
  [8.0, 'Good performance for most apps'], [7.5, 'Scales but less fine control'], [9.0, 'Simplest deploy — connect GitHub and go'],
  [7.0, null], [9.5, 'Easiest cloud platform period'], [5.0, 'Small platform'],
  [6.0, 'Small community'], [7.5, 'Clean docs'], [8.5, 'Managed everything'],
  [9.5, 'Fastest from repo to live URL'], [7.5, 'Usage-based, predictable'], [6.5, 'Proprietary platform'],
]);
scoreTech(23, [ // Render
  [8.0, 'Good performance'], [7.5, 'Auto-scaling available'], [8.5, 'Simple dashboard, git deploy'],
  [7.0, null], [9.0, 'Very easy to use'], [5.0, 'Small platform'],
  [6.0, 'Small community'], [7.5, 'Good documentation'], [8.5, 'Managed services'],
  [9.0, 'Quick setup'], [8.0, 'Predictable pricing'], [7.0, 'Standard hosting, portable'],
]);
scoreTech(24, [ // Cloudflare Workers
  [10.0, 'Edge compute, near-zero latency'], [9.0, 'Global by default'], [7.0, 'Unique runtime limitations'],
  [8.0, 'TypeScript supported'], [6.0, 'V8 isolate model is different'], [6.0, 'Niche skill'],
  [7.5, 'Growing ecosystem, KV, D1, R2'], [8.0, 'Good docs'], [8.0, 'Cloudflare manages infrastructure'],
  [7.0, 'Some apps need rewriting for edge'], [9.0, 'Very cheap at scale'], [5.5, 'Cloudflare-specific APIs'],
]);

// Auth (IDs 25-28)
scoreTech(25, [ // Clerk
  [8.0, null], [8.0, 'Managed scaling'], [9.5, 'Best-in-class components and DX'],
  [9.0, 'Excellent TypeScript SDK'], [9.5, 'Drop in and go'], [6.0, null],
  [7.0, 'Growing community'], [9.0, 'Excellent docs'], [9.0, 'Fully managed'],
  [10.0, 'Auth in minutes, not days'], [6.0, 'Pricing per MAU adds up'], [5.0, 'Proprietary, migration is painful'],
]);
scoreTech(26, [ // Auth.js
  [8.0, null], [7.0, 'Self-hosted, scale yourself'], [7.0, 'Flexible but config-heavy'],
  [7.5, 'TypeScript types improving'], [6.5, 'Configuration complexity'], [7.0, null],
  [8.5, 'Large community, many providers'], [7.0, 'Docs improving, v5 transition rough'], [6.5, 'Version transitions disruptive'],
  [7.0, 'Setup takes longer than managed'], [9.5, 'Free, self-hosted'], [9.5, 'Open-source, zero lock-in'],
]);
scoreTech(27, [ // Supabase Auth
  [8.5, null], [8.0, 'Managed with Supabase'], [8.5, 'RLS integration is powerful'],
  [8.0, 'Generated types'], [8.0, 'Easy if already using Supabase'], [6.5, null],
  [7.5, 'Supabase community'], [8.5, 'Well documented'], [8.5, 'Managed with Supabase'],
  [9.0, 'Fast if using Supabase stack'], [8.5, 'Included with Supabase'], [6.0, 'Tied to Supabase'],
]);
scoreTech(28, [ // Firebase Auth
  [8.0, null], [9.0, 'Google-scale infrastructure'], [7.5, 'Good SDKs but Firebase patterns'],
  [7.0, 'Typed SDKs'], [8.0, 'Easy setup'], [8.0, 'Very common skill'],
  [9.0, 'Massive ecosystem'], [8.0, 'Good docs'], [8.0, 'Google maintained'],
  [9.0, 'Quick setup'], [7.5, 'Free tier then pay per auth'], [4.5, 'Deep Google lock-in'],
]);

// Styling (IDs 29-32)
scoreTech(29, [ // Tailwind CSS
  [9.0, 'Tiny production bundles with purge'], [8.0, null], [8.5, 'Fast once learned, great with IntelliSense'],
  [7.0, 'Class-based, not type-checked'], [7.0, 'Utility memorization takes time'], [8.5, 'Very popular, easy to hire for'],
  [9.5, 'Massive ecosystem, plugins, UI kits'], [9.0, 'Excellent documentation'], [8.5, 'Stable, good upgrade path'],
  [9.0, 'Fastest styling once fluent'], [9.5, 'Free'], [9.5, 'Zero lock-in'],
]);
scoreTech(30, [ // CSS Modules
  [9.5, 'Zero runtime, scoped CSS'], [7.0, null], [7.0, 'Standard CSS, no special tooling'],
  [5.0, 'No type safety for class names'], [9.0, 'Just CSS with scoping'], [9.0, 'Everyone knows CSS'],
  [7.0, 'Built-in, no community needed'], [6.0, 'Minimal docs, standard CSS'], [9.0, 'Zero dependencies'],
  [7.5, 'Slower than utility CSS'], [9.5, 'Free'], [10.0, 'Zero lock-in, just CSS'],
]);
scoreTech(31, [ // Styled Components
  [6.5, 'Runtime overhead, SSR complexity'], [7.0, null], [8.0, 'Colocated styles, dynamic themes'],
  [8.0, 'TypeScript props for styles'], [7.0, 'Template literals for CSS'], [7.0, 'Well-known library'],
  [7.5, 'Mature ecosystem'], [7.5, 'Good docs'], [6.5, 'Performance concerns driving migration away'],
  [8.0, 'Quick for component libraries'], [9.0, 'Free'], [8.0, 'Standard React, portable'],
]);
scoreTech(32, [ // shadcn/ui
  [9.0, 'Radix + Tailwind, minimal overhead'], [8.0, null], [9.0, 'Copy-paste, own your code'],
  [9.0, 'TypeScript components with variants'], [8.0, 'Easy to use, Tailwind knowledge needed'], [7.0, 'Growing rapidly'],
  [8.5, 'Very active community'], [8.5, 'Good docs with examples'], [9.0, 'You own the code, update yourself'],
  [9.5, 'Fastest path to polished UI'], [9.5, 'Free'], [9.5, 'You own the code completely'],
]);

// --- Compatibility ---
const insertCompat = db.prepare('INSERT INTO compatibility (tech_a_id, tech_b_id, score, notes) VALUES (?, ?, ?, ?)');

// Next.js compatibility
insertCompat.run(1, 16, 9.5, 'Supabase + Next.js is the most popular full-stack combo in 2026');
insertCompat.run(1, 19, 10.0, 'Vercel built Next.js — best possible integration');
insertCompat.run(1, 25, 9.5, 'Clerk has first-class Next.js middleware integration');
insertCompat.run(1, 29, 9.5, 'Tailwind is the default CSS choice for Next.js');
insertCompat.run(1, 32, 9.5, 'shadcn/ui built specifically for Next.js + Tailwind');
insertCompat.run(1, 13, 9.0, 'Prisma + PostgreSQL is the standard Next.js database stack');
insertCompat.run(1, 26, 8.5, 'Auth.js v5 has deep Next.js integration');
insertCompat.run(1, 18, 8.5, 'Upstash Redis commonly used with Next.js for caching and rate limiting');

// Remix compatibility
insertCompat.run(2, 13, 9.0, 'Prisma + PostgreSQL works great with Remix loaders');
insertCompat.run(2, 21, 9.0, 'Fly.io is the recommended Remix hosting platform');
insertCompat.run(2, 29, 8.5, 'Tailwind works well with Remix');

// SvelteKit compatibility
insertCompat.run(4, 16, 8.5, 'Supabase has an official SvelteKit guide');
insertCompat.run(4, 19, 8.0, 'Vercel supports SvelteKit adapters');

// Django + FastAPI compatibility
insertCompat.run(10, 13, 9.5, 'Django ORM is built for PostgreSQL');
insertCompat.run(11, 13, 9.0, 'SQLAlchemy/Tortoise ORM with PostgreSQL is standard');
insertCompat.run(11, 15, 8.0, 'Motor driver for async MongoDB access');

// NestJS compatibility
insertCompat.run(9, 13, 9.0, 'TypeORM and Prisma both have NestJS modules');
insertCompat.run(9, 18, 9.0, 'NestJS has built-in Redis module for caching');

// Styling compatibility
insertCompat.run(29, 32, 10.0, 'shadcn/ui is built on Tailwind');
insertCompat.run(29, 1, 9.5, 'Tailwind is the default Next.js styling approach');

// --- Projects ---
const insertProject = db.prepare('INSERT INTO projects (name, team_size, budget, timeline, priority, industry, description) VALUES (?, ?, ?, ?, ?, ?, ?)');

insertProject.run('FinTrack SaaS MVP', 3, 'low', 'short', 'time_to_market', 'FinTech', 'A personal finance dashboard for freelancers — expense tracking, invoice management, tax estimates. Need to ship in 8 weeks.');
insertProject.run('HealthBridge Enterprise', 15, 'high', 'long', 'scalability', 'Healthcare', 'Patient portal and EHR integration platform for a hospital network. Must handle 500K+ patient records, HIPAA compliance, 99.99% uptime.');
insertProject.run('ArtisanMarket E-Commerce', 5, 'medium', 'medium', 'balanced', 'E-Commerce', 'Marketplace for handmade goods — product listings, seller onboarding, payment processing, and reviews. Targeting 10K sellers in year one.');
insertProject.run('DevToolkit Internal', 2, 'low', 'short', 'developer_experience', 'Engineering', 'Internal tool for the engineering team — deployment dashboard, feature flags, and incident timeline. Two devs, built between sprints.');

// --- Recommendations ---
const insertRec = db.prepare('INSERT INTO recommendations (project_id, technology_id, category, rank, weighted_score, rationale, tradeoffs) VALUES (?, ?, ?, ?, ?, ?, ?)');

// FinTrack SaaS MVP (project 1) — optimize for speed
insertRec.run(1, 1, 'frontend', 1, 9.2, 'Next.js gives you SSR, API routes, and the fastest path to deploy on Vercel', 'App Router complexity; Vercel costs at scale');
insertRec.run(1, 16, 'database', 1, 9.4, 'Supabase gives you Postgres + auth + realtime with zero setup', 'Less control than raw Postgres; some platform-specific features');
insertRec.run(1, 19, 'hosting', 1, 9.5, 'Vercel auto-deploys, preview URLs, and analytics out of the box', 'Serverless pricing model; strong Next.js coupling');
insertRec.run(1, 25, 'auth', 1, 9.6, 'Clerk gives you auth in 15 minutes with pre-built components', 'Per-MAU pricing; vendor lock-in');
insertRec.run(1, 29, 'styling', 1, 9.1, 'Tailwind + shadcn/ui = polished UI without a designer', 'Utility class learning curve');
insertRec.run(1, 32, 'styling', 2, 9.3, 'shadcn/ui components save weeks of UI development', 'Must know Tailwind and Radix patterns');

// HealthBridge Enterprise (project 2) — optimize for scale and reliability
insertRec.run(2, 6, 'frontend', 1, 8.8, 'Angular is battle-tested for enterprise healthcare — strong typing, DI, and large-team patterns', 'Steep learning curve; slower initial velocity');
insertRec.run(2, 9, 'backend', 1, 9.0, 'NestJS gives you enterprise-grade structure — modules, guards, interceptors for HIPAA compliance', 'More boilerplate; Angular-like patterns');
insertRec.run(2, 13, 'database', 1, 9.4, 'PostgreSQL with RLS for patient data isolation — extensions for audit logging and encryption', 'Requires DBA expertise for optimization at scale');
insertRec.run(2, 20, 'hosting', 1, 9.2, 'AWS for HIPAA-eligible services — VPC, encryption, compliance certifications', 'Complex setup; steep learning curve; higher ops burden');
insertRec.run(2, 18, 'database', 2, 8.5, 'Redis for session management and caching — microsecond latency for patient lookups', 'In-memory cost; persistence configuration needed');

// ArtisanMarket E-Commerce (project 3) — balanced
insertRec.run(3, 1, 'frontend', 1, 9.0, 'Next.js App Router for marketplace pages + API routes for seller dashboard', 'Bundle size management with many seller features');
insertRec.run(3, 13, 'database', 1, 9.2, 'PostgreSQL for transactional integrity — products, orders, and payments need ACID', 'Requires more setup than Supabase');
insertRec.run(3, 8, 'backend', 1, 8.5, 'Fastify for high-throughput API — product search and order processing', 'Smaller ecosystem than Express');
insertRec.run(3, 19, 'hosting', 1, 8.8, 'Vercel for frontend + Railway for API services', 'Split infrastructure adds complexity');
insertRec.run(3, 26, 'auth', 1, 8.0, 'Auth.js for seller and buyer auth — self-hosted, no per-user costs at 10K sellers', 'More configuration than Clerk');
insertRec.run(3, 29, 'styling', 1, 9.0, 'Tailwind for rapid UI iteration on marketplace design', null);

// DevToolkit Internal (project 4) — optimize for DX
insertRec.run(4, 4, 'frontend', 1, 9.0, 'SvelteKit for minimal boilerplate — two devs can ship fast with less code', 'Small hiring pool if team grows');
insertRec.run(4, 16, 'database', 1, 9.3, 'Supabase for instant API + realtime subscriptions for deployment status', 'Overkill for simple internal tool');
insertRec.run(4, 22, 'hosting', 1, 9.4, 'Railway for zero-config deploy — connect repo and go', 'Less fine control than AWS');
insertRec.run(4, 27, 'auth', 1, 8.5, 'Supabase Auth since already using Supabase — team SSO with RLS', 'Tied to Supabase platform');
insertRec.run(4, 29, 'styling', 1, 8.8, 'Tailwind for consistent styling without a design system', null);

console.log('Seeded tech stack decision engine database:');
console.log('  32 technologies across 6 categories');
console.log('  12 evaluation criteria');
console.log('  384 scores (32 technologies × 12 criteria)');
console.log('  4 sample projects');
console.log('  22 recommendations');
console.log('  20 compatibility entries');
