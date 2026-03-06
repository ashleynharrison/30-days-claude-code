import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { paletteGenerator } from './tools/palette-generator.js';
import { typographySystem } from './tools/typography-system.js';
import { tokenExport } from './tools/token-export.js';
import { componentSpecs } from './tools/component-specs.js';
import { brandGuidelines } from './tools/brand-guidelines.js';
import { styleAudit } from './tools/style-audit.js';

const server = new McpServer({
  name: 'brand-system',
  version: '1.0.0',
});

// Tool 1: Palette Generator
server.tool(
  'palette_generator',
  'Browse color palettes for any brand. Shows hex, HSL, RGB values plus WCAG contrast ratios and accessibility compliance. Filter by role or WCAG compliance.',
  {
    brand_id: z.number().optional().describe('Filter by brand ID (1=Aura Wellness, 2=Forge Labs, 3=Kindred Kitchen, 4=Vantage Advisory)'),
    role: z.string().optional().describe('Filter by color role (e.g. "primary", "accent", "neutral")'),
    wcag_compliant_only: z.boolean().optional().describe('Show only WCAG AA compliant colors for text use'),
  },
  async (params) => {
    const result = paletteGenerator(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

// Tool 2: Typography System
server.tool(
  'typography_system',
  'Get the complete typography system for any brand — font families, weights, fallback stacks, usage guidelines, and pairing rationale.',
  {
    brand_id: z.number().optional().describe('Filter by brand ID'),
    role: z.enum(['heading', 'body', 'accent', 'code', 'data']).optional().describe('Filter by typographic role'),
  },
  async (params) => {
    const result = typographySystem(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

// Tool 3: Token Export
server.tool(
  'token_export',
  'Export design tokens for a brand in CSS custom properties, JSON, or Tailwind config format. Includes spacing, border-radius, shadows, transitions, and colors.',
  {
    brand_id: z.number().describe('Brand ID to export tokens for (required)'),
    category: z.enum(['spacing', 'border-radius', 'shadow', 'transition', 'border']).optional().describe('Filter by token category'),
    format: z.enum(['css', 'json', 'tailwind']).optional().describe('Export format (default: css)'),
  },
  async (params) => {
    const result = tokenExport(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

// Tool 4: Component Specs
server.tool(
  'component_specs',
  'Get detailed component specifications — properties, usage guidelines, do/don\'t lists. Covers buttons, cards, badges, menu items, and more.',
  {
    brand_id: z.number().optional().describe('Filter by brand ID'),
    component_name: z.string().optional().describe('Search by component name (e.g. "Button", "Card", "StatusBadge")'),
  },
  async (params) => {
    const result = componentSpecs(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

// Tool 5: Brand Guidelines
server.tool(
  'brand_guidelines',
  'Access brand voice, imagery, and logo usage guidelines. Includes do/don\'t examples for brand voice, photography direction, and logo rules.',
  {
    brand_id: z.number().optional().describe('Filter by brand ID'),
    section: z.enum(['voice', 'imagery', 'logo']).optional().describe('Filter by guideline section'),
  },
  async (params) => {
    const result = brandGuidelines(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

// Tool 6: Style Audit
server.tool(
  'style_audit',
  'Run a style audit across brand systems. Surfaces accessibility issues, consistency problems, performance concerns, and brand violations with fix recommendations.',
  {
    brand_id: z.number().optional().describe('Audit a specific brand'),
    severity: z.enum(['high', 'medium', 'low']).optional().describe('Filter by severity level'),
    audit_type: z.enum(['accessibility', 'consistency', 'performance', 'brand']).optional().describe('Filter by audit type'),
  },
  async (params) => {
    const result = styleAudit(params);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Brand System MCP server running on stdio');
}

main().catch(console.error);
