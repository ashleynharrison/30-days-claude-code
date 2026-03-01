import { getInstructorStats } from '../database.js';

export function instructorStats(args: {
  date_from?: string;
  date_to?: string;
  instructor_name?: string;
}): string {
  const stats = getInstructorStats(args);

  if (stats.length === 0) {
    return 'No instructor data found for that period.';
  }

  const output: string[] = ['═══ INSTRUCTOR PERFORMANCE ═══', ''];

  stats.forEach((i: any) => {
    const fillBar = '█'.repeat(Math.round((i.avg_fill_rate || 0) / 10)) + '░'.repeat(10 - Math.round((i.avg_fill_rate || 0) / 10));

    output.push(`${i.name}`);
    output.push(`  Specialties: ${i.specialties}`);
    output.push(`  Classes taught: ${i.classes_taught}`);
    output.push(`  Total attendees: ${i.total_attendees} | Avg per class: ${i.avg_attendance}`);
    output.push(`  Fill rate: ${fillBar} ${i.avg_fill_rate || 0}%`);
    output.push(`  No-shows: ${i.total_no_shows}`);
    output.push(`  Rate: $${i.hourly_rate}/hr | Total cost: $${i.total_cost}`);
    output.push(`  Cost per attendee: $${i.total_attendees > 0 ? (i.total_cost / i.total_attendees).toFixed(2) : 'N/A'}`);
    output.push('');
  });

  return output.join('\n');
}
