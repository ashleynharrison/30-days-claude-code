# 30 Days of Claude Code

Every day for 30 days, I'm building a real, functional business tool for a different industry — using Claude Code.

No tutorials. No toy projects. Tools that a business could use tomorrow.

This is Day 2.

---

## Who's Building This

I'm Ashley — an operations professional with 13+ years of experience, currently working as a Program Specialist at Webflow. My day job is processing orders, tracking certification programs, and building documentation.

On the side, I run [Tell a Vsn](https://tellavsn.com) — a design and technology consultancy specializing in MCP integrations, AI engineering, custom development, and UI/UX design. The tagline is "Talk to your business" because I believe the best interface for your data is a conversation.

But mostly, I build.

I don't come from a traditional engineering background — I taught myself to read, understand, and work with code through FreeCodeCamp (4 certifications) and by building real things with AI tools. I learn fast, I grasp technical concepts quickly, and I close the gap between "I get what this does" and "I shipped it" faster than most people expect.

Before tech, I coordinated legal intake across three units at an immigration law firm in Los Angeles, managed client accounts at a medical-legal company, and streamlined scheduling operations at a court reporting firm. I've spent my career sitting at the intersection of people, process, and systems — and now I build the tools that connect all three.

---

## Why This Challenge

I keep hearing "AI will replace your job." I think that's backwards. The people who learn to build with AI will replace the people who don't.

This challenge is me proving that out — publicly. Every day, a new industry. A new problem. A new tool built with Claude Code in a single session. Some will be rough. Some will surprise me. All of them will ship.

30 industries. 30 tools. 30 days.

If you're a business owner watching this and thinking "I wish my data worked like that" — that's the point. Let's talk. ashley@tellavsn.com

---

## The Stack

Every project in this challenge is built with:
- **Claude Code** — Anthropic's CLI tool for agentic coding
- **TypeScript** — type safety for everything
- **MCP (Model Context Protocol)** — the open standard for connecting AI to real data
- **SQLite** — lightweight local data for each demo
- Whatever else the project calls for

No frameworks for the sake of frameworks. Just the right tool for the job.

---

## Day 1/30: Legal Firm Case Manager

**Talk to your cases.**

An MCP server that connects a legal firm's case management data to Claude. No dashboard to learn. No tabs to click through. Just ask.

### Example Queries

- "Which cases have hearings this week?"
- "Show me all of Maria's active immigration cases"
- "What tasks are overdue?"
- "Give me a summary of case 2025-CV-0142"
- "How many active cases does each attorney have?"

### Why Legal?

Before tech, I worked at an immigration law firm in Los Angeles, coordinating intake across three legal units — immigration, family law, and civil cases. I've seen firsthand how much time gets lost digging through case files for basic status updates. This tool makes that a one-sentence question.

### Tools

| Tool | What It Does |
|------|-------------|
| `search_cases` | Search by client, type, status, attorney, or free text |
| `get_case_details` | Full case record with tasks and client info |
| `upcoming_hearings` | All hearings within a date range |
| `overdue_tasks` | Tasks past due, with case context |
| `case_stats` | Dashboard summary across the firm |
| `search_clients` | Client lookup with associated cases |

### Setup

```bash
# Navigate to the project
cd day01-legal-firm

# Install dependencies
npm install

# Seed the database with demo data
npm run seed

# Build the server
npm run build
```

### Claude Desktop Configuration

Add this to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "legal-firm": {
      "command": "node",
      "args": ["/absolute/path/to/day01-legal-firm/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop, and you can start querying your cases.

### Demo Data

The seed script generates:
- **3 attorneys**: Maria Gutierrez (immigration + family law), David Chen (civil litigation + personal injury), Sarah Okafor (criminal defense)
- **1 paralegal**: Jamie Reeves
- **20 cases** across 5 practice areas
- **~40 tasks** with realistic deadlines and statuses
- **15 clients** with LA-area contact info
- Dates relative to today — hearings this week, overdue tasks, and upcoming deadlines

---

## Day 2/30: SaaS Billing Support — Talk to Your Billing Data

**Stop switching apps. Start asking.**

An MCP server that gives a billing support team instant access to customer accounts, invoices, transactions, and tickets through natural language.

### Example Queries

- "Did Greenfield Analytics get charged twice in January?"
- "Show me all failed payments this month"
- "What's the billing history for Brightpath Studios?"
- "Which customers have open refund requests?"
- "What's our current MRR breakdown by plan?"
- "Walk me through the proration on the Cascade Media downgrade"

### Why SaaS Billing?

I spent four years in billing support at a SaaS company. I've handled prorations, refunds, true-ups, failed payments, and every edge case in between — at high volume with a 95% CSAT rating. This tool solves the exact problem I lived every day: a customer writes in with a billing question, and the rep has to check three systems before they can even start typing a response.

One question should be enough.

### Tools

| Tool | What It Does |
|------|-------------|
| `lookup_customer` | Search customers by name, email, or plan |
| `get_billing_history` | Full invoice + transaction history for any account |
| `find_discrepancies` | Surface duplicate charges, failed payments, anomalies |
| `open_tickets` | View tickets by status, category, or assigned rep |
| `revenue_summary` | MRR dashboard — totals, by plan, churn, failed payments |
| `get_plan_changes` | Track upgrades, downgrades, and seat changes with prorations |

### Setup

```bash
# Navigate to the project
cd day02-saas-billing

# Install dependencies
npm install

# Seed the database with demo data
npm run seed

# Build the server
npm run build
```

### Claude Desktop Configuration

Add this to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "saas-billing": {
      "command": "node",
      "args": ["/absolute/path/to/day02-saas-billing/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop, and you can start querying billing data.

### Demo Data

The seed script generates:
- **30 customers** across Starter ($29/seat), Pro ($59/seat), Business ($99/seat), and Enterprise ($199/seat) plans
- **160+ invoices** spanning 6 months of billing history
- **200+ transactions** including charges, refunds, credits, and prorations
- **40 support tickets** across billing disputes, refund requests, plan changes, payment failures, invoice questions, and cancellations
- **25 plan changes** with proration calculations
- **4 support reps**: Priya Sharma, Marcus Lee, Rachel Torres, Devon Okafor
- **Realistic edge cases**: double charges, 3 failed payment retries, mid-cycle annual downgrade with proration, churned account with open refund, enterprise true-up (12 seats mid-quarter)

---

**Tell a Vsn** — Talk to your business.
[tellavsn.com](https://tellavsn.com) | ashley@tellavsn.com

Day 2 of 30. Follow along.
