# Day 4/30: Real Estate Agency — Talk to Your Listings

**Your MLS, but it talks back.**

An MCP server that connects a real estate agency's listings, clients, showings, and offers to Claude. Search your inventory, match buyers to properties, track your pipeline — all in plain English.

## Example Queries

- "Show me all 3-bed listings under $800K that have been sitting for 30+ days"
- "Which active listings have open houses this weekend?"
- "What properties match the Nguyen family's criteria?"
- "How many showings did the Silver Lake condo get this month?"
- "What's our pipeline looking like — any closings coming up?"
- "Which listings are stale and might need a price reduction?"

## Why Real Estate?

Real estate agents live inside their MLS, their CRM, their showing scheduler, and their email. Four systems, none of them talking to each other. The agent who can instantly pull up what matters — which listings are stale, which buyers are ready, which deals are about to close — wins. This tool makes that one question instead of four logins.

## Tools

| Tool | What It Does |
|------|-------------|
| `search_listings` | Filter by price, beds, neighborhood, status, features |
| `get_listing_details` | Full listing record with showings, offers, and tasks |
| `client_match` | Find active listings matching a buyer's criteria |
| `showing_schedule` | Upcoming and recent showings with feedback |
| `pipeline_summary` | Deal pipeline — active, pending, volume, closings, overdue tasks |
| `stale_listings` | Flag listings that need attention based on days on market and activity |

## Demo Data

- **3 agents** — Nicole Tran, Omar Farid, Jessie Park (coordinator)
- **40 listings** across LA neighborhoods — Silver Lake, Mar Vista, Eagle Rock, DTLA, Pasadena, Highland Park, Culver City
- **20 clients** — buyers, sellers, investors, and first-timers
- **60+ showings** with real feedback
- **15 offers** — accepted, rejected, countered, expired
- **30 tasks** — some overdue

Includes realistic edge cases: a listing 95+ days with only 2 showings (overpriced), a hot listing with 6 showings and 3 competing offers, a buyer who's seen 12 properties without making an offer, a listing that expired and relisted lower, and an accepted offer closing next week with 4 open tasks.

## Setup

```bash
cd day04-real-estate
npm install && npm run seed && npm run build
```

Then add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "real-estate": {
      "command": "node",
      "args": ["/absolute/path/to/day04-real-estate/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop and start asking questions.

---

**Tell a Vsn** — Talk to your business.
tellavsn.com | ashley@tellavsn.com

Day 4 of 30. Follow along.
