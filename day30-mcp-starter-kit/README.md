# Day 30 — The MCP Starter Kit

The capstone. A clean, copy-and-customize MCP server that demonstrates every
pattern used across the 29 builds before it. Fork it, rename `contacts` to
whatever your business actually tracks, and you have a working MCP server
your team can query from Claude Desktop.

## What's Inside

- **SQLite** with WAL mode and foreign keys
- **4 tables**: `contacts` (parent), `items` + `transactions` (children), `activity` (audit log)
- **6 MCP tools** covering the six patterns every MCP needs:
  1. `contact_lookup` — single-entity deep view
  2. `contact_upsert` — create-or-update with audit
  3. `items_list` — filtered list with aggregates
  4. `item_create` — create child linked to parent
  5. `analytics_summary` — business-wide rollup
  6. `activity_log` — "what happened" audit query

## Setup

```bash
cd day30-mcp-starter-kit
npm install && npm run seed && npm run build
```

Then add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "starter-kit": {
      "command": "node",
      "args": ["/absolute/path/to/day30-mcp-starter-kit/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop and ask: *"What's on the business? Give me the
summary."*

## Customizing

1. **Rename `contacts`** in `src/database.ts` to your primary entity
   (patients, listings, projects, …). Update the columns to match.
2. **Adjust `items` and `transactions`** — or delete them if you don't need
   child tables. The tools in `src/tools/` will work as long as you keep the
   column names used in the queries.
3. **Replace `src/seed.ts`** with your own seed data.
4. **Add tools** in `src/tools/` and register them in `src/index.ts`.

That's it. Every pattern you saw in Days 1–29 is built on this skeleton.
