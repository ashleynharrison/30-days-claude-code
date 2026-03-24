import db from './database.js';

// Clear existing data
db.exec(`
  DELETE FROM changelog;
  DELETE FROM dependencies;
  DELETE FROM accessibility_checks;
  DELETE FROM variants;
  DELETE FROM components;
  DELETE FROM tokens;
`);

const now = new Date();
function daysAgo(n: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString().replace('T', ' ').split('.')[0];
}

// ── Design Tokens ────────────────────────────────────────────────────
const insertToken = db.prepare(`INSERT INTO tokens (category, name, value, dark_value, description, css_variable, figma_ref, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

// Colors — Primary
insertToken.run('color', 'primary-50', '#EEF2FF', '#1E1B4B', 'Lightest primary tint', '--color-primary-50', 'Colors/Primary/50', daysAgo(90));
insertToken.run('color', 'primary-100', '#E0E7FF', '#312E81', 'Light primary', '--color-primary-100', 'Colors/Primary/100', daysAgo(90));
insertToken.run('color', 'primary-500', '#6366F1', '#818CF8', 'Primary brand color', '--color-primary-500', 'Colors/Primary/500', daysAgo(90));
insertToken.run('color', 'primary-600', '#4F46E5', '#A5B4FC', 'Primary hover state', '--color-primary-600', 'Colors/Primary/600', daysAgo(90));
insertToken.run('color', 'primary-700', '#4338CA', '#C7D2FE', 'Primary active state', '--color-primary-700', 'Colors/Primary/700', daysAgo(90));
insertToken.run('color', 'primary-900', '#312E81', '#EEF2FF', 'Darkest primary', '--color-primary-900', 'Colors/Primary/900', daysAgo(90));

// Colors — Neutral
insertToken.run('color', 'neutral-0', '#FFFFFF', '#0F172A', 'White / background', '--color-neutral-0', 'Colors/Neutral/0', daysAgo(90));
insertToken.run('color', 'neutral-50', '#F8FAFC', '#1E293B', 'Surface background', '--color-neutral-50', 'Colors/Neutral/50', daysAgo(90));
insertToken.run('color', 'neutral-100', '#F1F5F9', '#334155', 'Subtle background', '--color-neutral-100', 'Colors/Neutral/100', daysAgo(90));
insertToken.run('color', 'neutral-200', '#E2E8F0', '#475569', 'Border color', '--color-neutral-200', 'Colors/Neutral/200', daysAgo(90));
insertToken.run('color', 'neutral-500', '#64748B', '#94A3B8', 'Muted text', '--color-neutral-500', 'Colors/Neutral/500', daysAgo(90));
insertToken.run('color', 'neutral-700', '#334155', '#E2E8F0', 'Body text', '--color-neutral-700', 'Colors/Neutral/700', daysAgo(90));
insertToken.run('color', 'neutral-900', '#0F172A', '#F8FAFC', 'Heading text', '--color-neutral-900', 'Colors/Neutral/900', daysAgo(90));

// Colors — Semantic
insertToken.run('color', 'success-500', '#22C55E', '#4ADE80', 'Success state', '--color-success-500', 'Colors/Success/500', daysAgo(90));
insertToken.run('color', 'warning-500', '#F59E0B', '#FBBF24', 'Warning state', '--color-warning-500', 'Colors/Warning/500', daysAgo(90));
insertToken.run('color', 'error-500', '#EF4444', '#F87171', 'Error state', '--color-error-500', 'Colors/Error/500', daysAgo(90));

// Spacing
insertToken.run('spacing', 'space-1', '4px', null, 'Tightest spacing', '--space-1', 'Spacing/1', daysAgo(90));
insertToken.run('spacing', 'space-2', '8px', null, 'Compact spacing', '--space-2', 'Spacing/2', daysAgo(90));
insertToken.run('spacing', 'space-3', '12px', null, 'Default gap', '--space-3', 'Spacing/3', daysAgo(90));
insertToken.run('spacing', 'space-4', '16px', null, 'Standard spacing', '--space-4', 'Spacing/4', daysAgo(90));
insertToken.run('spacing', 'space-6', '24px', null, 'Section padding', '--space-6', 'Spacing/6', daysAgo(90));
insertToken.run('spacing', 'space-8', '32px', null, 'Large spacing', '--space-8', 'Spacing/8', daysAgo(90));
insertToken.run('spacing', 'space-12', '48px', null, 'Extra large spacing', '--space-12', 'Spacing/12', daysAgo(90));
insertToken.run('spacing', 'space-16', '64px', null, 'Section gap', '--space-16', 'Spacing/16', daysAgo(90));

// Typography
insertToken.run('typography', 'font-sans', 'Inter, system-ui, -apple-system, sans-serif', null, 'Default font family', '--font-sans', 'Typography/Family/Sans', daysAgo(90));
insertToken.run('typography', 'font-mono', 'JetBrains Mono, ui-monospace, monospace', null, 'Code font family', '--font-mono', 'Typography/Family/Mono', daysAgo(90));
insertToken.run('typography', 'text-xs', '12px / 16px', null, 'Extra small text', '--text-xs', 'Typography/Size/XS', daysAgo(90));
insertToken.run('typography', 'text-sm', '14px / 20px', null, 'Small text', '--text-sm', 'Typography/Size/SM', daysAgo(90));
insertToken.run('typography', 'text-base', '16px / 24px', null, 'Body text', '--text-base', 'Typography/Size/Base', daysAgo(90));
insertToken.run('typography', 'text-lg', '18px / 28px', null, 'Large text', '--text-lg', 'Typography/Size/LG', daysAgo(90));
insertToken.run('typography', 'text-xl', '20px / 28px', null, 'Heading 4', '--text-xl', 'Typography/Size/XL', daysAgo(90));
insertToken.run('typography', 'text-2xl', '24px / 32px', null, 'Heading 3', '--text-2xl', 'Typography/Size/2XL', daysAgo(90));
insertToken.run('typography', 'text-3xl', '30px / 36px', null, 'Heading 2', '--text-3xl', 'Typography/Size/3XL', daysAgo(90));
insertToken.run('typography', 'text-4xl', '36px / 40px', null, 'Heading 1', '--text-4xl', 'Typography/Size/4XL', daysAgo(90));
insertToken.run('typography', 'font-normal', '400', null, 'Normal weight', '--font-normal', 'Typography/Weight/Normal', daysAgo(90));
insertToken.run('typography', 'font-medium', '500', null, 'Medium weight', '--font-medium', 'Typography/Weight/Medium', daysAgo(90));
insertToken.run('typography', 'font-semibold', '600', null, 'Semibold weight', '--font-semibold', 'Typography/Weight/Semibold', daysAgo(90));
insertToken.run('typography', 'font-bold', '700', null, 'Bold weight', '--font-bold', 'Typography/Weight/Bold', daysAgo(90));

// Shadows
insertToken.run('shadow', 'shadow-sm', '0 1px 2px 0 rgb(0 0 0 / 0.05)', '0 1px 2px 0 rgb(0 0 0 / 0.3)', 'Subtle shadow', '--shadow-sm', 'Effects/Shadow/SM', daysAgo(90));
insertToken.run('shadow', 'shadow-md', '0 4px 6px -1px rgb(0 0 0 / 0.1)', '0 4px 6px -1px rgb(0 0 0 / 0.4)', 'Medium shadow', '--shadow-md', 'Effects/Shadow/MD', daysAgo(90));
insertToken.run('shadow', 'shadow-lg', '0 10px 15px -3px rgb(0 0 0 / 0.1)', '0 10px 15px -3px rgb(0 0 0 / 0.4)', 'Large shadow', '--shadow-lg', 'Effects/Shadow/LG', daysAgo(90));
insertToken.run('shadow', 'shadow-xl', '0 20px 25px -5px rgb(0 0 0 / 0.1)', '0 20px 25px -5px rgb(0 0 0 / 0.4)', 'Extra large shadow', '--shadow-xl', 'Effects/Shadow/XL', daysAgo(90));

// Radii
insertToken.run('radius', 'radius-sm', '4px', null, 'Small radius', '--radius-sm', 'Radii/SM', daysAgo(90));
insertToken.run('radius', 'radius-md', '6px', null, 'Medium radius', '--radius-md', 'Radii/MD', daysAgo(90));
insertToken.run('radius', 'radius-lg', '8px', null, 'Large radius', '--radius-lg', 'Radii/LG', daysAgo(90));
insertToken.run('radius', 'radius-xl', '12px', null, 'Extra large radius', '--radius-xl', 'Radii/XL', daysAgo(90));
insertToken.run('radius', 'radius-full', '9999px', null, 'Pill / circular', '--radius-full', 'Radii/Full', daysAgo(90));

// ── Components ────────────────────────────────────────────────────
const insertComponent = db.prepare(`INSERT INTO components (name, category, description, status, figma_url, storybook_url, owner, accessibility_score, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const comp1 = insertComponent.run('Button', 'actions', 'Primary interactive element for triggering actions. Supports multiple sizes, variants, icons, and loading states.', 'stable', 'https://figma.com/file/abc123/Button', 'https://storybook.example.com/?path=/story/button', 'Sarah Kim', 98, daysAgo(85), daysAgo(5)).lastInsertRowid;
const comp2 = insertComponent.run('Input', 'forms', 'Text input field with label, helper text, validation states, and optional leading/trailing icons.', 'stable', 'https://figma.com/file/abc123/Input', 'https://storybook.example.com/?path=/story/input', 'Marcus Chen', 95, daysAgo(80), daysAgo(10)).lastInsertRowid;
const comp3 = insertComponent.run('Modal', 'overlays', 'Overlay dialog for confirmations, forms, and content. Supports focus trapping, backdrop click dismiss, and stacked modals.', 'stable', 'https://figma.com/file/abc123/Modal', 'https://storybook.example.com/?path=/story/modal', 'Sarah Kim', 92, daysAgo(75), daysAgo(8)).lastInsertRowid;
const comp4 = insertComponent.run('Card', 'layout', 'Flexible container for grouping related content. Supports header, body, footer sections with optional media.', 'stable', 'https://figma.com/file/abc123/Card', 'https://storybook.example.com/?path=/story/card', 'Alex Rivera', 90, daysAgo(70), daysAgo(15)).lastInsertRowid;
const comp5 = insertComponent.run('Badge', 'data-display', 'Small label for status indicators, counts, and categories. Supports dot, icon, and removable variants.', 'stable', 'https://figma.com/file/abc123/Badge', 'https://storybook.example.com/?path=/story/badge', 'Marcus Chen', 96, daysAgo(65), daysAgo(20)).lastInsertRowid;
const comp6 = insertComponent.run('Toast', 'feedback', 'Non-blocking notification for success, error, warning, and info messages. Auto-dismisses with configurable duration.', 'stable', 'https://figma.com/file/abc123/Toast', 'https://storybook.example.com/?path=/story/toast', 'Sarah Kim', 88, daysAgo(60), daysAgo(3)).lastInsertRowid;
const comp7 = insertComponent.run('Avatar', 'data-display', 'User or entity representation. Supports image, initials fallback, status indicators, and group stacking.', 'stable', 'https://figma.com/file/abc123/Avatar', 'https://storybook.example.com/?path=/story/avatar', 'Alex Rivera', 94, daysAgo(55), daysAgo(25)).lastInsertRowid;
const comp8 = insertComponent.run('Tabs', 'navigation', 'Horizontal navigation between related panels. Supports icons, badges, disabled states, and lazy-loaded content.', 'beta', 'https://figma.com/file/abc123/Tabs', 'https://storybook.example.com/?path=/story/tabs', 'Marcus Chen', 85, daysAgo(30), daysAgo(2)).lastInsertRowid;
const comp9 = insertComponent.run('DataTable', 'data-display', 'Sortable, filterable table for structured data. Supports pagination, row selection, sticky headers, and responsive stacking.', 'beta', 'https://figma.com/file/abc123/DataTable', 'https://storybook.example.com/?path=/story/datatable', 'Sarah Kim', 78, daysAgo(20), daysAgo(1)).lastInsertRowid;
const comp10 = insertComponent.run('Select', 'forms', 'Dropdown selection with search, multi-select, grouping, and custom option rendering. Accessible combobox pattern.', 'draft', 'https://figma.com/file/abc123/Select', null, 'Alex Rivera', 72, daysAgo(10), daysAgo(1)).lastInsertRowid;
const comp11 = insertComponent.run('Tooltip', 'overlays', 'Contextual popup triggered on hover or focus. Supports multiple placements, custom content, and delay configuration.', 'stable', 'https://figma.com/file/abc123/Tooltip', 'https://storybook.example.com/?path=/story/tooltip', 'Marcus Chen', 91, daysAgo(50), daysAgo(12)).lastInsertRowid;
const comp12 = insertComponent.run('Skeleton', 'feedback', 'Loading placeholder that mimics content layout. Supports text, circular, and rectangular shapes with pulse animation.', 'draft', 'https://figma.com/file/abc123/Skeleton', null, 'Alex Rivera', 100, daysAgo(5), daysAgo(1)).lastInsertRowid;

// ── Variants ────────────────────────────────────────────────────
const insertVariant = db.prepare(`INSERT INTO variants (component_id, name, props, description, is_default) VALUES (?, ?, ?, ?, ?)`);

// Button variants
insertVariant.run(comp1, 'primary', '{"variant": "primary", "size": "md"}', 'Filled primary button', 1);
insertVariant.run(comp1, 'secondary', '{"variant": "secondary", "size": "md"}', 'Outlined secondary button', 0);
insertVariant.run(comp1, 'ghost', '{"variant": "ghost", "size": "md"}', 'Text-only ghost button', 0);
insertVariant.run(comp1, 'danger', '{"variant": "danger", "size": "md"}', 'Destructive action button', 0);
insertVariant.run(comp1, 'small', '{"variant": "primary", "size": "sm"}', 'Compact small button', 0);
insertVariant.run(comp1, 'large', '{"variant": "primary", "size": "lg"}', 'Large prominent button', 0);
insertVariant.run(comp1, 'icon-only', '{"variant": "ghost", "size": "md", "iconOnly": true}', 'Icon button without text', 0);
insertVariant.run(comp1, 'loading', '{"variant": "primary", "size": "md", "loading": true}', 'Button with spinner', 0);

// Input variants
insertVariant.run(comp2, 'default', '{"size": "md", "state": "default"}', 'Standard input', 1);
insertVariant.run(comp2, 'error', '{"size": "md", "state": "error"}', 'Input with error', 0);
insertVariant.run(comp2, 'disabled', '{"size": "md", "disabled": true}', 'Disabled input', 0);
insertVariant.run(comp2, 'with-icon', '{"size": "md", "leadingIcon": "search"}', 'Input with leading icon', 0);
insertVariant.run(comp2, 'textarea', '{"multiline": true, "rows": 4}', 'Multi-line text area', 0);

// Modal variants
insertVariant.run(comp3, 'default', '{"size": "md"}', 'Standard modal', 1);
insertVariant.run(comp3, 'small', '{"size": "sm"}', 'Compact confirmation dialog', 0);
insertVariant.run(comp3, 'large', '{"size": "lg"}', 'Wide content modal', 0);
insertVariant.run(comp3, 'fullscreen', '{"size": "full"}', 'Full-screen takeover', 0);

// Card variants
insertVariant.run(comp4, 'elevated', '{"variant": "elevated"}', 'Card with shadow', 1);
insertVariant.run(comp4, 'outlined', '{"variant": "outlined"}', 'Card with border', 0);
insertVariant.run(comp4, 'filled', '{"variant": "filled"}', 'Card with fill background', 0);
insertVariant.run(comp4, 'interactive', '{"variant": "elevated", "interactive": true}', 'Clickable card with hover state', 0);

// Badge variants
insertVariant.run(comp5, 'default', '{"variant": "default", "size": "md"}', 'Neutral badge', 1);
insertVariant.run(comp5, 'success', '{"variant": "success"}', 'Green success badge', 0);
insertVariant.run(comp5, 'warning', '{"variant": "warning"}', 'Amber warning badge', 0);
insertVariant.run(comp5, 'error', '{"variant": "error"}', 'Red error badge', 0);
insertVariant.run(comp5, 'dot', '{"variant": "default", "dot": true}', 'Badge with status dot', 0);

// Toast variants
insertVariant.run(comp6, 'success', '{"type": "success"}', 'Green success toast', 0);
insertVariant.run(comp6, 'error', '{"type": "error"}', 'Red error toast', 0);
insertVariant.run(comp6, 'warning', '{"type": "warning"}', 'Amber warning toast', 0);
insertVariant.run(comp6, 'info', '{"type": "info"}', 'Blue info toast', 1);

// Avatar variants
insertVariant.run(comp7, 'image', '{"src": "url", "size": "md"}', 'Avatar with image', 1);
insertVariant.run(comp7, 'initials', '{"name": "John Doe", "size": "md"}', 'Initials fallback', 0);
insertVariant.run(comp7, 'group', '{"users": [], "max": 3}', 'Stacked avatar group', 0);

// Tabs variants
insertVariant.run(comp8, 'default', '{"variant": "default"}', 'Standard horizontal tabs', 1);
insertVariant.run(comp8, 'pills', '{"variant": "pills"}', 'Pill-style tabs', 0);
insertVariant.run(comp8, 'underline', '{"variant": "underline"}', 'Underline indicator tabs', 0);

// DataTable variants
insertVariant.run(comp9, 'default', '{"size": "md", "striped": false}', 'Standard table', 1);
insertVariant.run(comp9, 'compact', '{"size": "sm", "striped": false}', 'Dense compact table', 0);
insertVariant.run(comp9, 'striped', '{"size": "md", "striped": true}', 'Alternating row colors', 0);

// Select variants
insertVariant.run(comp10, 'single', '{"multi": false}', 'Single-select dropdown', 1);
insertVariant.run(comp10, 'multi', '{"multi": true}', 'Multi-select with tags', 0);
insertVariant.run(comp10, 'searchable', '{"searchable": true}', 'Searchable combobox', 0);

// Tooltip variants
insertVariant.run(comp11, 'top', '{"placement": "top"}', 'Tooltip above trigger', 1);
insertVariant.run(comp11, 'right', '{"placement": "right"}', 'Tooltip to the right', 0);
insertVariant.run(comp11, 'bottom', '{"placement": "bottom"}', 'Tooltip below trigger', 0);

// Skeleton variants
insertVariant.run(comp12, 'text', '{"shape": "text", "lines": 3}', 'Text placeholder', 1);
insertVariant.run(comp12, 'circle', '{"shape": "circle"}', 'Circular placeholder (avatar)', 0);
insertVariant.run(comp12, 'rect', '{"shape": "rect", "height": 200}', 'Rectangular placeholder (image)', 0);

// ── Accessibility Checks ────────────────────────────────────────────
const insertA11y = db.prepare(`INSERT INTO accessibility_checks (component_id, check_type, description, passed, notes, checked_at) VALUES (?, ?, ?, ?, ?, ?)`);

// Button a11y
insertA11y.run(comp1, 'keyboard', 'Can be activated with Enter and Space keys', 1, null, daysAgo(5));
insertA11y.run(comp1, 'focus-visible', 'Has visible focus indicator', 1, null, daysAgo(5));
insertA11y.run(comp1, 'aria-label', 'Icon-only variant has aria-label', 1, null, daysAgo(5));
insertA11y.run(comp1, 'contrast', 'Text meets 4.5:1 contrast ratio on all variants', 1, null, daysAgo(5));
insertA11y.run(comp1, 'disabled', 'Disabled state is not focusable via aria-disabled', 1, 'Uses aria-disabled instead of disabled attr for screen reader announcement', daysAgo(5));

// Input a11y
insertA11y.run(comp2, 'label', 'Input is associated with label via htmlFor/id', 1, null, daysAgo(10));
insertA11y.run(comp2, 'error-announce', 'Error messages are announced via aria-describedby', 1, null, daysAgo(10));
insertA11y.run(comp2, 'required', 'Required state uses aria-required', 1, null, daysAgo(10));
insertA11y.run(comp2, 'focus-visible', 'Has visible focus ring', 1, null, daysAgo(10));
insertA11y.run(comp2, 'autocomplete', 'Supports autocomplete attribute for personal data fields', 0, 'Planned for next sprint', daysAgo(10));

// Modal a11y
insertA11y.run(comp3, 'focus-trap', 'Focus is trapped within modal when open', 1, null, daysAgo(8));
insertA11y.run(comp3, 'escape', 'Can be dismissed with Escape key', 1, null, daysAgo(8));
insertA11y.run(comp3, 'aria-modal', 'Uses aria-modal and role=dialog', 1, null, daysAgo(8));
insertA11y.run(comp3, 'focus-restore', 'Focus returns to trigger on close', 1, null, daysAgo(8));
insertA11y.run(comp3, 'scroll-lock', 'Background scroll is prevented when open', 0, 'Works on desktop but not iOS Safari', daysAgo(8));

// DataTable a11y
insertA11y.run(comp9, 'role', 'Uses proper table semantics (table, thead, tbody, th, td)', 1, null, daysAgo(1));
insertA11y.run(comp9, 'sort-announce', 'Sort direction announced via aria-sort', 1, null, daysAgo(1));
insertA11y.run(comp9, 'keyboard-nav', 'Rows navigable with arrow keys', 0, 'In progress — keyboard grid navigation not yet implemented', daysAgo(1));
insertA11y.run(comp9, 'responsive', 'Stacks into card layout on mobile with proper headings', 0, 'Mobile responsive variant still in development', daysAgo(1));

// Select a11y
insertA11y.run(comp10, 'combobox', 'Uses combobox ARIA pattern', 1, null, daysAgo(1));
insertA11y.run(comp10, 'listbox', 'Options use listbox/option roles', 1, null, daysAgo(1));
insertA11y.run(comp10, 'keyboard', 'Arrow keys navigate options, Enter selects', 0, 'Up/Down works but Home/End not yet supported', daysAgo(1));
insertA11y.run(comp10, 'screen-reader', 'Selected value announced on change', 0, 'Needs aria-live region for multi-select changes', daysAgo(1));

// Toast a11y
insertA11y.run(comp6, 'aria-live', 'Uses aria-live="polite" for non-critical, "assertive" for errors', 1, null, daysAgo(3));
insertA11y.run(comp6, 'dismiss', 'Can be dismissed with close button or Escape', 1, null, daysAgo(3));
insertA11y.run(comp6, 'motion', 'Respects prefers-reduced-motion for animations', 0, 'Animation plays regardless of motion preference', daysAgo(3));

// ── Dependencies ────────────────────────────────────────────────────
const insertDep = db.prepare(`INSERT INTO dependencies (component_id, depends_on_type, depends_on_name, relationship) VALUES (?, ?, ?, ?)`);

// Button dependencies
insertDep.run(comp1, 'token', 'primary-500', 'uses');
insertDep.run(comp1, 'token', 'radius-md', 'uses');
insertDep.run(comp1, 'token', 'shadow-sm', 'uses');
insertDep.run(comp1, 'token', 'font-medium', 'uses');

// Input dependencies
insertDep.run(comp2, 'token', 'neutral-200', 'uses');
insertDep.run(comp2, 'token', 'radius-md', 'uses');
insertDep.run(comp2, 'token', 'error-500', 'uses');

// Modal dependencies
insertDep.run(comp3, 'token', 'shadow-xl', 'uses');
insertDep.run(comp3, 'token', 'radius-xl', 'uses');
insertDep.run(comp3, 'component', 'Button', 'contains');

// Card dependencies
insertDep.run(comp4, 'token', 'shadow-md', 'uses');
insertDep.run(comp4, 'token', 'radius-lg', 'uses');
insertDep.run(comp4, 'token', 'neutral-0', 'uses');

// Badge dependencies
insertDep.run(comp5, 'token', 'radius-full', 'uses');
insertDep.run(comp5, 'token', 'text-xs', 'uses');

// Toast dependencies
insertDep.run(comp6, 'token', 'shadow-lg', 'uses');
insertDep.run(comp6, 'token', 'radius-lg', 'uses');
insertDep.run(comp6, 'component', 'Button', 'contains');

// DataTable dependencies
insertDep.run(comp9, 'component', 'Badge', 'contains');
insertDep.run(comp9, 'component', 'Avatar', 'contains');
insertDep.run(comp9, 'token', 'neutral-100', 'uses');

// Select dependencies
insertDep.run(comp10, 'token', 'neutral-200', 'uses');
insertDep.run(comp10, 'token', 'primary-500', 'uses');
insertDep.run(comp10, 'component', 'Badge', 'contains');

// ── Changelog ────────────────────────────────────────────────────
const insertLog = db.prepare(`INSERT INTO changelog (component_id, token_id, action, description, author, version, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`);

insertLog.run(null, null, 'init', 'Initial design system setup — 45 tokens across 5 categories', 'Sarah Kim', '0.1.0', daysAgo(90));
insertLog.run(comp1, null, 'add', 'Button component added with primary, secondary, ghost, and danger variants', 'Sarah Kim', '0.2.0', daysAgo(85));
insertLog.run(comp2, null, 'add', 'Input component added with error states and icon support', 'Marcus Chen', '0.3.0', daysAgo(80));
insertLog.run(comp3, null, 'add', 'Modal component added with focus trapping and stacked support', 'Sarah Kim', '0.4.0', daysAgo(75));
insertLog.run(comp4, null, 'add', 'Card component added with elevated, outlined, and filled variants', 'Alex Rivera', '0.5.0', daysAgo(70));
insertLog.run(comp5, null, 'add', 'Badge component added with semantic color variants', 'Marcus Chen', '0.6.0', daysAgo(65));
insertLog.run(comp6, null, 'add', 'Toast component added with auto-dismiss and action support', 'Sarah Kim', '0.7.0', daysAgo(60));
insertLog.run(comp7, null, 'add', 'Avatar component added with image, initials, and group support', 'Alex Rivera', '0.8.0', daysAgo(55));
insertLog.run(comp11, null, 'add', 'Tooltip component added with multi-placement support', 'Marcus Chen', '0.9.0', daysAgo(50));
insertLog.run(comp8, null, 'add', 'Tabs component added (beta) — pills and underline variants', 'Marcus Chen', '0.10.0', daysAgo(30));
insertLog.run(comp9, null, 'add', 'DataTable component added (beta) — sorting, pagination, row selection', 'Sarah Kim', '0.11.0', daysAgo(20));
insertLog.run(comp1, null, 'update', 'Button — added loading state variant with spinner', 'Sarah Kim', '0.11.1', daysAgo(15));
insertLog.run(comp10, null, 'add', 'Select component added (draft) — single and multi-select with search', 'Alex Rivera', '0.12.0', daysAgo(10));
insertLog.run(comp12, null, 'add', 'Skeleton component added (draft) — text, circle, and rect shapes', 'Alex Rivera', '0.12.1', daysAgo(5));
insertLog.run(comp6, null, 'fix', 'Toast — fixed z-index stacking issue when multiple toasts are visible', 'Sarah Kim', '0.12.2', daysAgo(3));
insertLog.run(comp9, null, 'update', 'DataTable — added sticky header option and column resizing', 'Sarah Kim', '0.12.3', daysAgo(1));

// Count and log
const tokenCount = (db.prepare('SELECT COUNT(*) as c FROM tokens').get() as any).c;
const componentCount = (db.prepare('SELECT COUNT(*) as c FROM components').get() as any).c;
const variantCount = (db.prepare('SELECT COUNT(*) as c FROM variants').get() as any).c;
const a11yCount = (db.prepare('SELECT COUNT(*) as c FROM accessibility_checks').get() as any).c;
const depCount = (db.prepare('SELECT COUNT(*) as c FROM dependencies').get() as any).c;
const logCount = (db.prepare('SELECT COUNT(*) as c FROM changelog').get() as any).c;

console.log(`Seeded: ${tokenCount} tokens, ${componentCount} components, ${variantCount} variants, ${a11yCount} a11y checks, ${depCount} dependencies, ${logCount} changelog entries`);
