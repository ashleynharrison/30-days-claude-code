import db from './database.js';

db.exec(`
  DELETE FROM style_audits;
  DELETE FROM brand_guidelines;
  DELETE FROM component_specs;
  DELETE FROM design_tokens;
  DELETE FROM typography;
  DELETE FROM color_palettes;
  DELETE FROM brands;
`);

// ============================================================
// BRANDS — 4 distinct brand systems
// ============================================================
const insertBrand = db.prepare(`
  INSERT INTO brands (name, tagline, industry, personality, target_audience, status, created_at, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const brands = [
  ['Aura Wellness', 'Breathe. Move. Restore.', 'Health & Wellness', 'Calm, premium, approachable, natural', 'Women 28-45, urban professionals, mindfulness-curious', 'active', '2026-01-15 09:00:00', 'Boutique wellness studio. Yoga, breathwork, sound healing. Premium positioning without pretension.'],
  ['Forge Labs', 'Ship faster. Break less.', 'Developer Tools / SaaS', 'Technical, confident, sharp, minimal', 'Senior engineers, DevOps leads, CTOs at Series A-C startups', 'active', '2026-02-01 10:00:00', 'CI/CD platform for high-velocity teams. Competing with GitHub Actions and CircleCI.'],
  ['Kindred Kitchen', 'Real food. Real people.', 'Food & Beverage', 'Warm, artisanal, community-driven, honest', 'Families 30-50, food-conscious, local-first mindset', 'active', '2026-02-10 14:00:00', 'Farm-to-table restaurant group with 4 locations. Expanding to meal delivery.'],
  ['Vantage Advisory', 'Clarity at the top.', 'Financial Services', 'Authoritative, refined, trustworthy, modern', 'C-suite executives, board members, PE/VC firms', 'draft', '2026-03-01 09:00:00', 'Boutique M&A advisory. $50M-$500M deal range. Needs to compete with bulge bracket on credibility.'],
];

for (const b of brands) {
  insertBrand.run(...b);
}

// ============================================================
// COLOR PALETTES
// ============================================================
const insertColor = db.prepare(`
  INSERT INTO color_palettes (brand_id, role, name, hex, hsl, rgb, usage, contrast_on_white, contrast_on_black, wcag_aa_text, wcag_aaa_text)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Aura Wellness — Earthy, muted, calming
const auraColors = [
  [1, 'primary', 'Sage', '#7B9E87', 'hsl(140, 13%, 55%)', 'rgb(123, 158, 135)', 'Primary brand color. Headers, CTAs, navigation highlights.', '3.1:1', '4.2:1', 0, 0],
  [1, 'primary-dark', 'Deep Sage', '#4A6B54', 'hsl(140, 18%, 35%)', 'rgb(74, 107, 84)', 'Text on light backgrounds, active states, footer.', '5.8:1', '2.3:1', 1, 0],
  [1, 'secondary', 'Terracotta', '#C4836A', 'hsl(18, 40%, 59%)', 'rgb(196, 131, 106)', 'Accent color. Highlights, icons, hover states.', '2.7:1', '4.8:1', 0, 0],
  [1, 'neutral-light', 'Linen', '#F5F0EB', 'hsl(30, 33%, 94%)', 'rgb(245, 240, 235)', 'Page backgrounds, card surfaces, light sections.', '1.1:1', '17.5:1', 0, 0],
  [1, 'neutral-dark', 'Charcoal', '#2D3331', 'hsl(150, 7%, 19%)', 'rgb(45, 51, 49)', 'Body text, headings, high-contrast elements.', '12.5:1', '1.1:1', 1, 1],
  [1, 'accent', 'Honey', '#D4A84B', 'hsl(42, 60%, 56%)', 'rgb(212, 168, 75)', 'Sparingly. Premium badge, testimonial highlights.', '2.2:1', '6.2:1', 0, 0],
];

// Forge Labs — High-contrast, technical, dark-mode native
const forgeColors = [
  [2, 'primary', 'Electric Blue', '#3B82F6', 'hsl(217, 91%, 60%)', 'rgb(59, 130, 246)', 'Primary actions, links, active states, focus rings.', '3.1:1', '4.6:1', 0, 0],
  [2, 'primary-dark', 'Deep Blue', '#1D4ED8', 'hsl(224, 76%, 48%)', 'rgb(29, 78, 216)', 'Pressed states, dark-mode primary on light surfaces.', '5.2:1', '2.6:1', 1, 0],
  [2, 'success', 'Terminal Green', '#22C55E', 'hsl(142, 71%, 45%)', 'rgb(34, 197, 94)', 'Build passed, success states, positive metrics.', '2.3:1', '5.9:1', 0, 0],
  [2, 'danger', 'Alert Red', '#EF4444', 'hsl(0, 84%, 60%)', 'rgb(239, 68, 68)', 'Build failed, errors, destructive actions.', '3.1:1', '4.6:1', 0, 0],
  [2, 'neutral-bg', 'Void', '#0F172A', 'hsl(222, 47%, 11%)', 'rgb(15, 23, 42)', 'Dark-mode background. Default canvas.', '16.8:1', '1.0:1', 1, 1],
  [2, 'neutral-surface', 'Slate 800', '#1E293B', 'hsl(217, 33%, 17%)', 'rgb(30, 41, 59)', 'Cards, panels, elevated surfaces in dark mode.', '14.2:1', '1.2:1', 1, 1],
  [2, 'neutral-text', 'Slate 300', '#CBD5E1', 'hsl(213, 27%, 84%)', 'rgb(203, 213, 225)', 'Body text on dark backgrounds.', '1.5:1', '11.4:1', 0, 0],
];

// Kindred Kitchen — Warm, organic, inviting
const kindredColors = [
  [3, 'primary', 'Brick Red', '#A3392B', 'hsl(6, 58%, 40%)', 'rgb(163, 57, 43)', 'Primary brand. Headers, CTAs, logo mark.', '5.4:1', '2.5:1', 1, 0],
  [3, 'primary-light', 'Tomato', '#D45B4B', 'hsl(6, 58%, 56%)', 'rgb(212, 91, 75)', 'Hover states, secondary buttons, accents.', '3.2:1', '4.2:1', 0, 0],
  [3, 'secondary', 'Olive', '#6B7D3A', 'hsl(76, 37%, 36%)', 'rgb(107, 125, 58)', 'Fresh/organic indicators, secondary accent, icons.', '4.1:1', '3.2:1', 1, 0],
  [3, 'warm-neutral', 'Cream', '#FDF6ED', 'hsl(36, 83%, 96%)', 'rgb(253, 246, 237)', 'Page backgrounds, menu backgrounds.', '1.0:1', '18.6:1', 0, 0],
  [3, 'dark', 'Espresso', '#2C1810', 'hsl(16, 44%, 12%)', 'rgb(44, 24, 16)', 'Primary text, headings.', '15.2:1', '1.0:1', 1, 1],
  [3, 'accent', 'Mustard', '#D4A020', 'hsl(44, 73%, 47%)', 'rgb(212, 160, 32)', 'Specials, seasonal highlights, badges.', '2.4:1', '5.7:1', 0, 0],
];

// Vantage Advisory — Cool, authoritative, restrained
const vantageColors = [
  [4, 'primary', 'Navy', '#1B2A4A', 'hsl(219, 44%, 20%)', 'rgb(27, 42, 74)', 'Primary brand. Logo, headers, hero sections.', '12.8:1', '1.1:1', 1, 1],
  [4, 'primary-light', 'Steel Blue', '#4A6FA5', 'hsl(215, 37%, 47%)', 'rgb(74, 111, 165)', 'Links, secondary headings, data visualizations.', '3.8:1', '3.5:1', 1, 0],
  [4, 'accent', 'Gold', '#B8860B', 'hsl(43, 89%, 38%)', 'rgb(184, 134, 11)', 'Premium indicators, awards, partnership badges.', '3.4:1', '3.9:1', 0, 0],
  [4, 'neutral-light', 'Ivory', '#F8F6F3', 'hsl(36, 33%, 96%)', 'rgb(248, 246, 243)', 'Page backgrounds, content areas.', '1.1:1', '17.8:1', 0, 0],
  [4, 'neutral-mid', 'Silver', '#9CA3AF', 'hsl(218, 11%, 65%)', 'rgb(156, 163, 175)', 'Borders, dividers, secondary text.', '2.6:1', '5.2:1', 0, 0],
  [4, 'neutral-dark', 'Graphite', '#1F2937', 'hsl(217, 33%, 17%)', 'rgb(31, 41, 55)', 'Body text, data tables, footer.', '14.2:1', '1.2:1', 1, 1],
];

for (const c of [...auraColors, ...forgeColors, ...kindredColors, ...vantageColors]) {
  insertColor.run(...c);
}

// ============================================================
// TYPOGRAPHY
// ============================================================
const insertType = db.prepare(`
  INSERT INTO typography (brand_id, role, font_family, font_source, weight_range, fallback_stack, usage, pairing_rationale)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const typeStyles = [
  // Aura Wellness
  [1, 'heading', 'Cormorant Garamond', 'Google Fonts', '300, 400, 600', 'Georgia, "Times New Roman", serif', 'All headings (h1-h4), hero text, pull quotes.', 'Elegant serif with high contrast strokes. Conveys luxury wellness without being stuffy.'],
  [1, 'body', 'DM Sans', 'Google Fonts', '400, 500, 700', '"Helvetica Neue", Arial, sans-serif', 'Body text, UI elements, navigation, buttons.', 'Clean geometric sans pairs well with Cormorant. Highly legible at small sizes.'],
  [1, 'accent', 'Caveat', 'Google Fonts', '400, 700', '"Brush Script MT", cursive', 'Handwritten annotations, testimonial attribution, organic touches.', 'Adds human warmth. Use sparingly — max 2 instances per page.'],

  // Forge Labs
  [2, 'heading', 'Inter', 'Google Fonts', '500, 600, 700, 800', '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', 'All headings, navigation, feature labels.', 'Industry-standard sans for dev tools. Excellent at all sizes, great tabular figures for metrics.'],
  [2, 'body', 'Inter', 'Google Fonts', '400, 500', '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', 'Body text, documentation, UI copy.', 'Single-font system reduces load time. Weight variation provides hierarchy.'],
  [2, 'code', 'JetBrains Mono', 'Google Fonts', '400, 700', '"Fira Code", "SF Mono", Menlo, monospace', 'Code samples, terminal output, CLI examples, config snippets.', 'Developer-native monospace. Ligature support for code readability.'],

  // Kindred Kitchen
  [3, 'heading', 'Playfair Display', 'Google Fonts', '400, 700, 900', 'Georgia, "Palatino Linotype", serif', 'Restaurant name, menu section headers, hero text.', 'High-contrast serif with editorial feel. Evokes farm-to-table authenticity.'],
  [3, 'body', 'Source Sans 3', 'Google Fonts', '400, 600', '"Helvetica Neue", Arial, sans-serif', 'Menu descriptions, body copy, location details, hours.', 'Neutral, highly readable sans. Doesn\'t compete with expressive heading font.'],
  [3, 'accent', 'Caveat', 'Google Fonts', '400, 700', '"Brush Script MT", cursive', 'Handwritten specials, chalkboard-style callouts, seasonal notes.', 'Adds warmth and artisanal feel. Connects to hand-painted signage aesthetic.'],

  // Vantage Advisory
  [4, 'heading', 'EB Garamond', 'Google Fonts', '400, 500, 700', 'Garamond, Georgia, serif', 'Firm name, section headings, report titles, thought leadership headers.', 'Classic Garamond signals tradition and trust. Used by top-tier financial firms.'],
  [4, 'body', 'Inter', 'Google Fonts', '400, 500', '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', 'Body copy, data tables, contact information, navigation.', 'Modern sans for readability in data-dense contexts. Contrasts well with traditional heading serif.'],
  [4, 'data', 'Tabular Figures (Inter)', 'Google Fonts', '400, 600', '"SF Mono", Menlo, monospace', 'Financial figures, deal sizes, percentages, metrics.', 'Tabular figures ensure columns align. Critical for credibility in financial presentations.'],
];

for (const t of typeStyles) {
  insertType.run(...t);
}

// ============================================================
// DESIGN TOKENS
// ============================================================
const insertToken = db.prepare(`
  INSERT INTO design_tokens (brand_id, category, token_name, value, css_variable, description)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const tokens = [
  // Aura Wellness tokens
  [1, 'spacing', 'space-xs', '4px', '--space-xs', 'Tight spacing. Icon padding, inline gaps.'],
  [1, 'spacing', 'space-sm', '8px', '--space-sm', 'Small spacing. Form field padding, list gaps.'],
  [1, 'spacing', 'space-md', '16px', '--space-md', 'Default spacing. Card padding, section gaps.'],
  [1, 'spacing', 'space-lg', '32px', '--space-lg', 'Large spacing. Section padding, hero margins.'],
  [1, 'spacing', 'space-xl', '64px', '--space-xl', 'Extra large. Page section vertical padding.'],
  [1, 'spacing', 'space-2xl', '128px', '--space-2xl', 'Hero-level spacing. Landing page breathing room.'],
  [1, 'border-radius', 'radius-sm', '4px', '--radius-sm', 'Subtle rounding. Buttons, inputs.'],
  [1, 'border-radius', 'radius-md', '8px', '--radius-md', 'Default rounding. Cards, modals.'],
  [1, 'border-radius', 'radius-lg', '16px', '--radius-lg', 'Soft rounding. Feature cards, images.'],
  [1, 'border-radius', 'radius-full', '9999px', '--radius-full', 'Pill shape. Tags, badges, avatars.'],
  [1, 'shadow', 'shadow-sm', '0 1px 2px rgba(0,0,0,0.05)', '--shadow-sm', 'Subtle elevation. Buttons, inputs.'],
  [1, 'shadow', 'shadow-md', '0 4px 12px rgba(0,0,0,0.08)', '--shadow-md', 'Cards, dropdowns, popovers.'],
  [1, 'shadow', 'shadow-lg', '0 12px 32px rgba(0,0,0,0.12)', '--shadow-lg', 'Modals, hero cards, floating elements.'],
  [1, 'transition', 'transition-fast', '150ms ease', '--transition-fast', 'Hover states, color changes.'],
  [1, 'transition', 'transition-base', '250ms ease', '--transition-base', 'Default transitions. Opacity, transforms.'],
  [1, 'transition', 'transition-slow', '400ms ease-out', '--transition-slow', 'Page transitions, reveals, modals.'],

  // Forge Labs tokens
  [2, 'spacing', 'space-1', '4px', '--space-1', 'Minimum spacing unit.'],
  [2, 'spacing', 'space-2', '8px', '--space-2', 'Tight UI spacing.'],
  [2, 'spacing', 'space-4', '16px', '--space-4', 'Default component padding.'],
  [2, 'spacing', 'space-6', '24px', '--space-6', 'Card padding, section gaps.'],
  [2, 'spacing', 'space-8', '32px', '--space-8', 'Section spacing.'],
  [2, 'spacing', 'space-16', '64px', '--space-16', 'Page-level spacing.'],
  [2, 'border-radius', 'radius-sm', '4px', '--radius-sm', 'Inputs, code blocks.'],
  [2, 'border-radius', 'radius-md', '6px', '--radius-md', 'Buttons, cards.'],
  [2, 'border-radius', 'radius-lg', '8px', '--radius-lg', 'Panels, modals.'],
  [2, 'border', 'border-subtle', '1px solid rgba(255,255,255,0.06)', '--border-subtle', 'Dark-mode card borders.'],
  [2, 'border', 'border-default', '1px solid rgba(255,255,255,0.1)', '--border-default', 'Input borders, dividers.'],
  [2, 'shadow', 'shadow-glow', '0 0 16px rgba(59,130,246,0.15)', '--shadow-glow', 'Focus rings, active states.'],

  // Kindred Kitchen tokens
  [3, 'spacing', 'space-xs', '4px', '--space-xs', null],
  [3, 'spacing', 'space-sm', '8px', '--space-sm', null],
  [3, 'spacing', 'space-md', '16px', '--space-md', null],
  [3, 'spacing', 'space-lg', '32px', '--space-lg', null],
  [3, 'spacing', 'space-xl', '64px', '--space-xl', null],
  [3, 'border-radius', 'radius-sm', '2px', '--radius-sm', 'Minimal rounding. Keeps editorial feel.'],
  [3, 'border-radius', 'radius-md', '4px', '--radius-md', 'Buttons, menu cards.'],
  [3, 'border-radius', 'radius-lg', '8px', '--radius-lg', 'Photo cards, feature sections.'],
  [3, 'shadow', 'shadow-warm', '0 4px 16px rgba(44,24,16,0.08)', '--shadow-warm', 'Warm-toned shadows matching brand.'],

  // Vantage tokens
  [4, 'spacing', 'space-xs', '4px', '--space-xs', null],
  [4, 'spacing', 'space-sm', '8px', '--space-sm', null],
  [4, 'spacing', 'space-md', '16px', '--space-md', null],
  [4, 'spacing', 'space-lg', '24px', '--space-lg', null],
  [4, 'spacing', 'space-xl', '48px', '--space-xl', null],
  [4, 'spacing', 'space-2xl', '96px', '--space-2xl', null],
  [4, 'border-radius', 'radius-sm', '2px', '--radius-sm', 'Minimal rounding. Professional restraint.'],
  [4, 'border-radius', 'radius-md', '4px', '--radius-md', 'Buttons, inputs, data cards.'],
  [4, 'shadow', 'shadow-subtle', '0 1px 3px rgba(0,0,0,0.04)', '--shadow-subtle', 'Understated elevation. Data cards.'],
  [4, 'shadow', 'shadow-elevated', '0 8px 24px rgba(0,0,0,0.06)', '--shadow-elevated', 'Featured content, modals.'],
];

for (const t of tokens) {
  insertToken.run(...t);
}

// ============================================================
// COMPONENT SPECS
// ============================================================
const insertComponent = db.prepare(`
  INSERT INTO component_specs (brand_id, component_name, variant, properties, usage_guidelines, do_list, dont_list)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const components = [
  // Aura Wellness
  [1, 'Button', 'primary', JSON.stringify({
    background: 'var(--color-sage)', color: '#FFFFFF', padding: '12px 24px',
    borderRadius: 'var(--radius-sm)', fontFamily: 'DM Sans', fontWeight: 500,
    fontSize: '14px', letterSpacing: '0.02em', textTransform: 'none',
    hover: { background: 'var(--color-deep-sage)' }, transition: 'var(--transition-fast)'
  }), 'Primary actions: Book a class, Sign up, Reserve. One per section maximum.',
    JSON.stringify(['Use for the single most important action', 'Pair with descriptive text', 'Ensure sufficient contrast']),
    JSON.stringify(['Use multiple primary buttons in one view', 'Use for navigation links', 'Use all caps'])],

  [1, 'Button', 'secondary', JSON.stringify({
    background: 'transparent', color: 'var(--color-deep-sage)', padding: '12px 24px',
    border: '1px solid var(--color-sage)', borderRadius: 'var(--radius-sm)',
    fontFamily: 'DM Sans', fontWeight: 500, fontSize: '14px',
    hover: { background: 'var(--color-sage)', color: '#FFFFFF' }
  }), 'Secondary actions: Learn more, View schedule, Read more.',
    JSON.stringify(['Use alongside a primary button', 'Use for lower-priority actions']),
    JSON.stringify(['Use without a nearby primary button', 'Use for destructive actions'])],

  [1, 'Card', 'class-listing', JSON.stringify({
    background: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '24px',
    boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(123,158,135,0.1)',
    hover: { boxShadow: 'var(--shadow-md)', transform: 'translateY(-2px)' }
  }), 'Class listings on schedule page. Shows class name, instructor, time, spots.',
    JSON.stringify(['Include instructor photo', 'Show remaining spots', 'Use subtle hover elevation']),
    JSON.stringify(['Overcrowd with information', 'Use bright colors for the card itself', 'Add more than one CTA per card'])],

  // Forge Labs
  [2, 'Button', 'primary', JSON.stringify({
    background: 'var(--color-electric-blue)', color: '#FFFFFF', padding: '8px 16px',
    borderRadius: 'var(--radius-md)', fontFamily: 'Inter', fontWeight: 600,
    fontSize: '13px', letterSpacing: '0', textTransform: 'none',
    hover: { background: 'var(--color-deep-blue)' }, transition: '150ms ease'
  }), 'Primary CTAs: Deploy, Run build, Create pipeline. Compact and action-oriented.',
    JSON.stringify(['Use imperative verbs: Deploy, Run, Create', 'Keep labels under 3 words', 'One primary per panel']),
    JSON.stringify(['Use soft language: "Maybe try...", "Consider..."', 'Add icons to every button', 'Use rounded pill shape'])],

  [2, 'StatusBadge', 'build-status', JSON.stringify({
    padding: '2px 8px', borderRadius: '4px', fontFamily: 'Inter', fontWeight: 600,
    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em',
    variants: { passed: { bg: 'rgba(34,197,94,0.15)', color: '#22C55E' }, failed: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' }, running: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' } }
  }), 'Build pipeline status indicators. Always paired with timestamp.',
    JSON.stringify(['Show duration alongside status', 'Use consistent placement', 'Include tooltip with details']),
    JSON.stringify(['Use status colors for non-status elements', 'Mix status badge with other badge types'])],

  [2, 'CodeBlock', 'default', JSON.stringify({
    background: 'var(--color-void)', borderRadius: 'var(--radius-sm)',
    padding: '16px', fontFamily: 'JetBrains Mono', fontSize: '13px',
    lineHeight: 1.6, border: 'var(--border-subtle)', color: 'var(--color-slate-300)',
    syntaxHighlighting: true, copyButton: true
  }), 'Code examples, config snippets, CLI output.',
    JSON.stringify(['Include copy button', 'Show language label', 'Use syntax highlighting']),
    JSON.stringify(['Wrap long lines without scroll', 'Use light background for code blocks', 'Omit language label'])],

  // Kindred Kitchen
  [3, 'MenuItem', 'default', JSON.stringify({
    layout: 'flex row', gap: '16px', padding: '16px 0',
    borderBottom: '1px solid rgba(44,24,16,0.08)',
    nameFont: 'Playfair Display 700', nameSize: '18px',
    priceFont: 'Source Sans 3 600', priceSize: '16px',
    descriptionFont: 'Source Sans 3 400', descriptionSize: '14px',
    descriptionColor: 'rgba(44,24,16,0.7)'
  }), 'Menu item display. Name, price, description, dietary tags.',
    JSON.stringify(['Lead with dish name', 'Keep descriptions under 2 lines', 'Use icons for dietary info (GF, V, VG)']),
    JSON.stringify(['Include photos in list view (too heavy)', 'Use decimal prices ($14 not $14.00)', 'Truncate descriptions'])],

  // Vantage Advisory
  [4, 'DealCard', 'default', JSON.stringify({
    background: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '24px',
    border: '1px solid rgba(156,163,175,0.2)', boxShadow: 'var(--shadow-subtle)',
    headerFont: 'EB Garamond 700', headerSize: '20px',
    metricFont: 'Inter tabular', metricSize: '28px', metricWeight: 600,
    labelFont: 'Inter 400', labelSize: '12px', labelColor: 'var(--color-silver)',
    textTransform: 'uppercase', letterSpacing: '0.05em'
  }), 'Deal summary cards for portfolio and pitch decks. Shows company, deal size, status.',
    JSON.stringify(['Use tabular figures for financials', 'Show deal stage as subtle badge', 'Include sector tag']),
    JSON.stringify(['Use color to indicate deal quality', 'Show too many metrics per card (max 3)', 'Use abbreviations without explanation'])],
];

for (const c of components) {
  insertComponent.run(...c);
}

// ============================================================
// BRAND GUIDELINES
// ============================================================
const insertGuideline = db.prepare(`
  INSERT INTO brand_guidelines (brand_id, section, title, content, examples, priority)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const guidelines = [
  // Aura Wellness
  [1, 'voice', 'Brand Voice', 'Aura speaks like a knowledgeable friend, not a guru. Calm but not passive. Informed but not clinical. We invite, never pressure. Use "you" more than "we." Avoid wellness jargon that excludes beginners.', JSON.stringify({ do: ['Join us for a restorative session', 'Your body knows what it needs', 'New to breathwork? Start here.'], dont: ['Unlock your chakras', 'Transform your life in 30 days', 'Our expert-led modalities'] }), 1],
  [1, 'imagery', 'Photography Style', 'Natural light only. Warm tones, soft shadows. Show real people (diverse body types, ages, ethnicities) in authentic practice moments — not posed perfection. No stock photo energy. Backgrounds: studio wood floors, plants, linen textures.', null, 2],
  [1, 'logo', 'Logo Usage', 'Minimum clear space: 2x the height of the "a" in Aura. Never place on busy backgrounds without a semi-transparent overlay. Logo color: Deep Sage on light, Linen on dark. Never stretch, rotate, or add effects.', null, 3],

  // Forge Labs
  [2, 'voice', 'Brand Voice', 'Forge speaks like a senior engineer who respects your time. Direct, precise, no fluff. We say what the product does, not what it "empowers" you to do. Technical accuracy over marketing polish. If a feature has limits, we say so.', JSON.stringify({ do: ['Deploys in 47 seconds. Average.', 'Parallel builds. Up to 32 workers.', 'We don\'t support Kubernetes yet. It\'s on the roadmap.'], dont: ['Supercharge your workflow!', 'Unleash the power of CI/CD', 'Seamless, end-to-end DevOps transformation'] }), 1],
  [2, 'imagery', 'Visual Language', 'No stock photos. Ever. Use: code screenshots (real, not mockups), terminal output, architecture diagrams, data visualizations. If showing UI, use actual product screenshots. Dark mode default for all visual assets.', null, 2],
  [2, 'logo', 'Logo Usage', 'Monochrome only. White on dark, Void on light. No gradients, no color fills. Minimum size: 24px height for digital. Clear space: 1.5x the height of the mark. The wordmark and icon can be used separately.', null, 3],

  // Kindred Kitchen
  [3, 'voice', 'Brand Voice', 'Kindred speaks like the friend who cooks Sunday dinner and wants everyone to feel at home. Warm, honest, unpretentious. We celebrate the farmer, the recipe, the table. Avoid fine-dining formality and food-science jargon.', JSON.stringify({ do: ['Made with tomatoes from Greenfield Farm, 12 miles away', 'Bring the whole family. We mean it.', 'Ask your server what\'s fresh today — it changes.'], dont: ['Curated tasting experience', 'Deconstructed farm-to-fork gastronomy', 'Artisanally crafted flavor profiles'] }), 1],
  [3, 'imagery', 'Photography Style', 'Overhead and 45-degree angles. Natural light, warm white balance. Show hands — cooking, serving, eating. Food should look honest: slightly imperfect plating, real portions, crumbs on the table. Include people at the table when possible.', null, 2],

  // Vantage Advisory
  [4, 'voice', 'Brand Voice', 'Vantage speaks with quiet authority. We don\'t need to be loud because our track record speaks. Formal but not stuffy. Data-driven but not robotic. Every sentence should convey competence and discretion.', JSON.stringify({ do: ['We advised on $2.3B in completed transactions in 2025.', 'The market conditions suggest a measured approach.', 'Our team brings 120+ years of combined transaction experience.'], dont: ['We crush deals!', 'Synergistic value creation opportunities', 'Disrupting the M&A landscape'] }), 1],
  [4, 'imagery', 'Photography Style', 'Black and white or desaturated. Architectural photography (modern offices, city skylines). No handshake photos. No stock boardroom shots. If showing people, candid over posed. Shot from a slight distance — the viewer is an observer, not a participant.', null, 2],
  [4, 'logo', 'Logo Usage', 'Navy on Ivory, or Gold on Navy. Never colorize beyond brand palette. Minimum size: 32px height. The full wordmark is preferred over the icon. Clear space: 3x the height of the "V" mark. In print, always use Pantone 289 C.', null, 3],
];

for (const g of guidelines) {
  insertGuideline.run(...g);
}

// ============================================================
// STYLE AUDITS
// ============================================================
const insertAudit = db.prepare(`
  INSERT INTO style_audits (brand_id, audit_type, severity, element, issue, recommendation, auto_fixable, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const audits = [
  [1, 'accessibility', 'high', 'Primary button on Linen background', 'Sage (#7B9E87) on Linen (#F5F0EB) has 3.1:1 contrast ratio — fails WCAG AA for normal text.', 'Use Deep Sage (#4A6B54) for text on light backgrounds. Reserve Sage for large headings (24px+) or decorative elements only.', 0, '2026-03-01 10:00:00'],
  [1, 'accessibility', 'medium', 'Honey accent on white', 'Honey (#D4A84B) on white has 2.2:1 contrast — fails WCAG AA for any text.', 'Never use Honey for text. Restrict to decorative borders, backgrounds with dark text overlay, or large icons.', 0, '2026-03-01 10:00:00'],
  [1, 'consistency', 'medium', 'Heading font weights', 'H1 uses weight 300 (light) while H2 uses weight 600 (semibold). Inverted hierarchy.', 'Use 600 for H1, 400 for H2-H3, or consistently use 400 throughout with size for hierarchy.', 1, '2026-03-01 10:00:00'],
  [2, 'accessibility', 'low', 'Slate 300 on Slate 800 surface', 'Body text contrast on elevated surfaces is 7.2:1 — passes AA but below AAA (7:1 threshold).', 'Acceptable for body text. For critical UI labels, consider using pure white (#FFFFFF) at 11.4:1.', 0, '2026-03-01 10:00:00'],
  [2, 'consistency', 'high', 'Button padding inconsistency', 'Primary button uses 8px 16px while secondary uses 10px 20px. Misaligned when placed side by side.', 'Standardize to 8px 16px for all button variants. Use size variants (sm/md/lg) for different contexts.', 1, '2026-03-01 10:00:00'],
  [2, 'performance', 'medium', 'JetBrains Mono loading', 'Loading 2 weights of JetBrains Mono (400, 700) adds ~45KB to initial page load.', 'Subset to Latin characters only (saves ~30KB). Use font-display: swap. Consider loading only on pages with code blocks.', 0, '2026-03-01 10:00:00'],
  [3, 'accessibility', 'high', 'Mustard accent text', 'Mustard (#D4A020) on Cream (#FDF6ED) has 2.4:1 contrast — fails WCAG AA.', 'Use Mustard only as background color with Espresso text, or as decorative borders. Never as text color on light backgrounds.', 0, '2026-03-01 10:00:00'],
  [3, 'consistency', 'low', 'Caveat font overuse', 'Caveat appears in 5 places on homepage — exceeds "max 2 instances per page" guideline.', 'Reduce to 2: hero tagline + one testimonial. Remove from navigation and footer.', 1, '2026-03-01 10:00:00'],
  [4, 'accessibility', 'medium', 'Gold on Navy contrast', 'Gold (#B8860B) on Navy (#1B2A4A) has 3.9:1 — passes AA for large text only.', 'Acceptable for headings 18px+ bold or 24px+ regular. Do not use for body text or small labels.', 0, '2026-03-01 10:00:00'],
  [4, 'brand', 'high', 'Logo on gradient background', 'Logo placed on blue-to-navy gradient violates clear background guideline.', 'Place logo on solid Navy or solid Ivory only. If gradient is required, add solid-color strip behind logo.', 0, '2026-03-01 10:00:00'],
];

for (const a of audits) {
  insertAudit.run(...a);
}

console.log('Seeded: 4 brands, 25 colors, 12 type styles, 42 tokens, 8 component specs, 10 guidelines, 10 style audits');
