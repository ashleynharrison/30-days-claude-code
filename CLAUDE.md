# 30 Days of Claude Code — Claude Notes

## Ship Checklist (every new day)

When building and deploying a new day, complete ALL of these steps:

1. **Build the MCP server** in `dayNN-<name>/`
   - `package.json` with `"type": "module"`
   - `tsconfig.json` (ES2022, Node16)
   - `src/database.ts`, `src/seed.ts`, `src/index.ts`, `src/tools/*.ts`
   - Run `npm install && npm run seed && npm run build` — must pass clean

2. **Create the landing page** at `app/day/N/page.tsx`
   - Follow the pattern from previous days (hero, example queries, tools table, why section, data overview, setup, CTA)

3. **Add to `app/days-data.ts`** — add the new day entry with title, industry, description, icon name, tools count, and `status: 'shipped'`

4. **Add icon to `app/page.tsx`** — import the Lucide icon and add it to `iconMap`

5. **Update `30-DAY-PLAN.md`** — mark the day with checkmark in the calendar table and add to the "Days Shipped" list

6. **Update `tsconfig.json`** — confirm the new `dayNN-*` pattern is in the exclude array (already pre-filled through day30)

7. **Commit and push** — stage all new/modified files, commit, push to `origin/main` to trigger Vercel deploy

## Project Structure

- **Landing site**: Next.js 15 + Tailwind at root `/`
- **MCP servers**: Each in `dayNN-<name>/` with TypeScript + SQLite + better-sqlite3 + @modelcontextprotocol/sdk
- **Homepage data**: `app/days-data.ts` feeds the card list on the homepage
- **Deploys**: Vercel auto-deploys on push to `origin/main`
- **tsconfig.json**: All `dayNN-*` directories are excluded from Next.js compilation (they have their own tsconfig)

## Common Gotchas

- Forgetting to add the day to `days-data.ts` = homepage won't show it (the `/day/N` page will work but nobody can navigate to it)
- Forgetting to add the icon to `iconMap` in `page.tsx` = falls back to Scale icon
- MCP server dirs not in tsconfig exclude = Vercel build fails (can't find better-sqlite3)
