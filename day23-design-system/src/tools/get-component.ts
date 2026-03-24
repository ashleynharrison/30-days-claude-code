import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerGetComponent(server: McpServer) {
  server.tool(
    'get_component',
    'Get detailed view of a single component — all variants with props, accessibility checks, token dependencies, component dependencies, and recent changelog.',
    {
      name: z.string().describe('Component name (e.g., Button, Input, Modal)'),
    },
    async ({ name }) => {
      const component = db.prepare(`SELECT * FROM components WHERE LOWER(name) = LOWER(?)`).get(name) as any;

      if (!component) {
        return { content: [{ type: 'text' as const, text: `Component "${name}" not found. Use list_components to see available components.` }] };
      }

      // Variants
      const variants = db.prepare(`SELECT * FROM variants WHERE component_id = ? ORDER BY is_default DESC, name`).all(component.id) as any[];

      // Accessibility checks
      const a11yChecks = db.prepare(`SELECT * FROM accessibility_checks WHERE component_id = ? ORDER BY passed DESC, check_type`).all(component.id) as any[];

      // Dependencies
      const deps = db.prepare(`SELECT * FROM dependencies WHERE component_id = ?`).all(component.id) as any[];

      // What depends on this component
      const dependents = db.prepare(`SELECT c.name, d.relationship FROM dependencies d JOIN components c ON c.id = d.component_id WHERE d.depends_on_type = 'component' AND LOWER(d.depends_on_name) = LOWER(?)`).all(component.name) as any[];

      // Recent changelog
      const logs = db.prepare(`SELECT * FROM changelog WHERE component_id = ? ORDER BY created_at DESC LIMIT 5`).all(component.id) as any[];

      const a11yPassed = a11yChecks.filter((c: any) => c.passed).length;
      const a11yFailing = a11yChecks.filter((c: any) => !c.passed);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            component: {
              name: component.name,
              category: component.category,
              description: component.description,
              status: component.status,
              owner: component.owner,
              accessibility_score: component.accessibility_score,
              figma_url: component.figma_url,
              storybook_url: component.storybook_url,
              created_at: component.created_at,
              updated_at: component.updated_at,
            },
            variants: variants.map((v: any) => ({
              name: v.name,
              props: JSON.parse(v.props),
              description: v.description,
              is_default: !!v.is_default,
            })),
            accessibility: {
              score: component.accessibility_score,
              checks_passed: `${a11yPassed}/${a11yChecks.length}`,
              failing_checks: a11yFailing.map((c: any) => ({
                type: c.check_type,
                description: c.description,
                notes: c.notes,
              })),
              all_checks: a11yChecks.map((c: any) => ({
                type: c.check_type,
                description: c.description,
                passed: !!c.passed,
                notes: c.notes,
              })),
            },
            dependencies: {
              tokens_used: deps.filter((d: any) => d.depends_on_type === 'token').map((d: any) => d.depends_on_name),
              components_used: deps.filter((d: any) => d.depends_on_type === 'component').map((d: any) => ({ name: d.depends_on_name, relationship: d.relationship })),
              used_by: dependents.map((d: any) => ({ name: d.name, relationship: d.relationship })),
            },
            recent_changes: logs.map((l: any) => ({
              action: l.action,
              description: l.description,
              author: l.author,
              version: l.version,
              date: l.created_at,
            })),
          }, null, 2),
        }],
      };
    }
  );
}
