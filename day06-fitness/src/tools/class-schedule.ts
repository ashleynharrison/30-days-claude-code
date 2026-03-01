import { getClassSchedule } from '../database.js';

export function classSchedule(args: {
  date_from?: string;
  date_to?: string;
  class_type?: string;
  instructor_name?: string;
  day_of_week?: number;
}): string {
  const schedule = getClassSchedule(args);

  if (schedule.length === 0) {
    return 'No classes found matching those criteria.';
  }

  const output: string[] = [`═══ CLASS SCHEDULE (${schedule.length} session${schedule.length !== 1 ? 's' : ''}) ═══`, ''];

  // Group by date
  const byDate = new Map<string, any[]>();
  schedule.forEach((s: any) => {
    const arr = byDate.get(s.instance_date) || [];
    arr.push(s);
    byDate.set(s.instance_date, arr);
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  byDate.forEach((classes, date) => {
    const d = new Date(date + 'T12:00:00');
    const dayName = dayNames[d.getDay()];
    output.push(`── ${dayName}, ${date} ──`);

    classes.forEach((c: any) => {
      const statusIcon = c.instance_status === 'scheduled' ? '🟢' : c.instance_status === 'completed' ? '✅' : '❌';
      const spotsLeft = c.capacity - c.booked_count;
      const spotsLabel = spotsLeft <= 0 ? '⚠️ FULL' : spotsLeft <= 3 ? `⚠️ ${spotsLeft} spots left` : `${spotsLeft} spots open`;
      const waitlist = c.waitlist_count > 0 ? ` | ${c.waitlist_count} waitlisted` : '';

      output.push(`  ${statusIcon} ${c.start_time} — ${c.class_name} (${c.class_type})`);
      output.push(`     ${c.duration_minutes} min | ${c.room} | ${c.instructor_name}`);
      output.push(`     ${c.booked_count}/${c.capacity} booked (${spotsLabel}${waitlist})`);
    });

    output.push('');
  });

  return output.join('\n');
}
