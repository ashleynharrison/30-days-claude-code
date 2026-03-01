import { getAttendanceReport } from '../database.js';

export function attendanceReport(args: {
  date_from?: string;
  date_to?: string;
  class_type?: string;
}): string {
  const report = getAttendanceReport(args);

  const output: string[] = ['═══ ATTENDANCE REPORT ═══', ''];

  // Overview
  const o = report.overview;
  if (o) {
    output.push('── Overview ──');
    output.push(`  Total completed sessions: ${o.total_classes}`);
    output.push(`  Total attended: ${o.total_attended}`);
    output.push(`  Total no-shows: ${o.total_no_shows}`);
    output.push(`  Total cancellations: ${o.total_cancellations}`);
    output.push(`  Avg attendance per class: ${o.avg_attendance || 'N/A'}`);
    output.push('');
  }

  // By class
  if (report.byClass && report.byClass.length > 0) {
    output.push('── By Class ──');
    report.byClass.forEach((c: any) => {
      const fillBar = '█'.repeat(Math.round((c.fill_rate || 0) / 10)) + '░'.repeat(10 - Math.round((c.fill_rate || 0) / 10));
      output.push(`  ${c.name} (${c.class_type})`);
      output.push(`    ${c.sessions} sessions | ${c.attended} attended | ${c.no_shows} no-shows`);
      output.push(`    Fill rate: ${fillBar} ${c.fill_rate || 0}% (capacity: ${c.capacity})`);
    });
    output.push('');
  }

  // By time slot
  if (report.byTimeSlot && report.byTimeSlot.length > 0) {
    output.push('── By Time Slot ──');
    report.byTimeSlot.forEach((t: any) => {
      output.push(`  ${t.start_time} — ${t.sessions} sessions, avg ${t.avg_per_session} attendees/session`);
    });
    output.push('');
  }

  return output.join('\n');
}
