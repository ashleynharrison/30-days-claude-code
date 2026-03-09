import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import db from '../database.js';

export function registerRetentionReport(server: McpServer) {
  server.tool(
    'retention_report',
    'Donor retention analysis — LYBUNT (Last Year But Unfortunately Not This), SYBUNT (Some Years But Unfortunately Not This), lapsed donors, new donors, and retention rate.',
    {
      current_year: z.string().optional().describe('The "current" year to analyze (default: 2026). Format: YYYY'),
    },
    async ({ current_year }) => {
      const year = current_year || '2026';
      const prevYear = String(Number(year) - 1);

      // Donors who gave this year
      const thisYearDonors = db.prepare(`
        SELECT DISTINCT donor_id FROM donations WHERE date >= ? AND date < ?
      `).all(`${year}-01-01`, `${Number(year) + 1}-01-01`) as any[];
      const thisYearIds = new Set(thisYearDonors.map((d) => d.donor_id));

      // Donors who gave last year
      const lastYearDonors = db.prepare(`
        SELECT DISTINCT donor_id FROM donations WHERE date >= ? AND date < ?
      `).all(`${prevYear}-01-01`, `${year}-01-01`) as any[];
      const lastYearIds = new Set(lastYearDonors.map((d) => d.donor_id));

      // Donors who gave any prior year but not this year
      const anyPriorDonors = db.prepare(`
        SELECT DISTINCT donor_id FROM donations WHERE date < ?
      `).all(`${year}-01-01`) as any[];
      const anyPriorIds = new Set(anyPriorDonors.map((d) => d.donor_id));

      // LYBUNT: gave last year, not this year
      const lybuntIds = [...lastYearIds].filter((id) => !thisYearIds.has(id));
      const lybuntDonors = lybuntIds.length > 0
        ? db.prepare(`SELECT id, name, email, total_given, giving_level FROM donors WHERE id IN (${lybuntIds.join(',')})`).all() as any[]
        : [];

      // SYBUNT: gave some prior year, not last year, not this year
      const sybuntIds = [...anyPriorIds].filter((id) => !lastYearIds.has(id) && !thisYearIds.has(id));
      const sybuntDonors = sybuntIds.length > 0
        ? db.prepare(`SELECT id, name, email, total_given, giving_level FROM donors WHERE id IN (${sybuntIds.join(',')})`).all() as any[]
        : [];

      // New donors this year (first gift in current year)
      const newDonors = db.prepare(`
        SELECT DISTINCT d.donor_id, don.name, don.email, don.total_given
        FROM donations d JOIN donors don ON don.id = d.donor_id
        WHERE d.date >= ? AND d.date < ? AND d.donor_id NOT IN (
          SELECT DISTINCT donor_id FROM donations WHERE date < ?
        )
      `).all(`${year}-01-01`, `${Number(year) + 1}-01-01`, `${year}-01-01`) as any[];

      // Retained: gave last year AND this year
      const retainedIds = [...lastYearIds].filter((id) => thisYearIds.has(id));

      // Retention rate
      const retentionRate = lastYearIds.size > 0
        ? Math.round((retainedIds.length / lastYearIds.size) * 100)
        : 0;

      // Revenue comparison
      const thisYearRevenue = db.prepare(`
        SELECT SUM(amount) as total FROM donations WHERE date >= ? AND date < ?
      `).get(`${year}-01-01`, `${Number(year) + 1}-01-01`) as any;

      const lastYearRevenue = db.prepare(`
        SELECT SUM(amount) as total FROM donations WHERE date >= ? AND date < ?
      `).get(`${prevYear}-01-01`, `${year}-01-01`) as any;

      // LYBUNT with last gift info
      const lybuntWithDetails = lybuntDonors.map((d) => {
        const lastGift = db.prepare(
          `SELECT amount, date FROM donations WHERE donor_id = ? ORDER BY date DESC LIMIT 1`
        ).get(d.id) as any;
        const lastContact = db.prepare(
          `SELECT type, date FROM engagements WHERE donor_id = ? ORDER BY date DESC LIMIT 1`
        ).get(d.id) as any;
        return {
          name: d.name,
          email: d.email,
          lifetime_giving: d.total_given,
          giving_level: d.giving_level,
          last_gift: lastGift ? { amount: lastGift.amount, date: lastGift.date } : null,
          last_contact: lastContact ? { type: lastContact.type, date: lastContact.date } : null,
        };
      });

      const result = {
        analysis_year: year,
        retention: {
          rate: retentionRate,
          donors_last_year: lastYearIds.size,
          donors_this_year: thisYearIds.size,
          retained: retainedIds.length,
          lapsed_from_last_year: lybuntIds.length,
        },
        revenue: {
          this_year: thisYearRevenue?.total || 0,
          last_year: lastYearRevenue?.total || 0,
          year_over_year_change: lastYearRevenue?.total
            ? Math.round(((thisYearRevenue?.total || 0) - lastYearRevenue.total) / lastYearRevenue.total * 100)
            : 0,
        },
        lybunt: {
          label: `Gave in ${prevYear}, not yet in ${year}`,
          count: lybuntWithDetails.length,
          donors: lybuntWithDetails,
        },
        sybunt: {
          label: `Gave before ${prevYear}, not since`,
          count: sybuntDonors.length,
          donors: sybuntDonors.map((d) => ({ name: d.name, email: d.email, lifetime_giving: d.total_given })),
        },
        new_donors: {
          label: `First gift in ${year}`,
          count: newDonors.length,
          donors: newDonors.map((d) => ({ name: d.name, email: d.email })),
        },
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
