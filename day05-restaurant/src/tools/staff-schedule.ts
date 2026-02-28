import { getStaffSchedule } from '../database.js';

export function staffSchedule(args: {
  date?: string;
  role?: string;
  staff_name?: string;
}): string {
  const results = getStaffSchedule(args);

  if (results.length === 0) {
    return 'No shifts found matching your criteria.';
  }

  // Group by date
  const byDate = new Map<string, any[]>();
  results.forEach((s: any) => {
    const arr = byDate.get(s.shift_date) || [];
    arr.push(s);
    byDate.set(s.shift_date, arr);
  });

  const sections: string[] = [];
  byDate.forEach((shifts, date) => {
    const lines = shifts.map((s: any) => {
      const role = s.role_override || s.role;
      const clockedIn = s.actual_start ? `Clocked in: ${s.actual_start.split(' ')[1] || s.actual_start}` : 'Not clocked in';
      const clockedOut = s.actual_end ? `Clocked out: ${s.actual_end.split(' ')[1] || s.actual_end}` : s.actual_start ? 'Still on shift' : '';
      const hours = s.scheduled_hours ? `${s.scheduled_hours}h scheduled` : '';
      return [
        `  ${s.name} — ${role}`,
        `    Scheduled: ${s.scheduled_start} – ${s.scheduled_end} (${hours})`,
        `    ${clockedIn}${clockedOut ? ' | ' + clockedOut : ''}`,
      ].join('\n');
    });

    const totalHours = shifts.reduce((sum: number, s: any) => sum + (s.scheduled_hours || 0), 0);
    sections.push(`${date} (${shifts.length} staff, ${totalHours.toFixed(1)} total hours):\n${lines.join('\n\n')}`);
  });

  return sections.join('\n\n');
}
