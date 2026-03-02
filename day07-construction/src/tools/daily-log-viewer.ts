import { getDailyLogs } from '../database.js';

export function dailyLogViewer(args: {
  project_id?: number;
  date_from?: string;
  date_to?: string;
}): string {
  const logs = getDailyLogs(args);

  if (logs.length === 0) {
    return 'No daily logs found for that period.';
  }

  const output: string[] = [`═══ DAILY LOGS (${logs.length} entries) ═══`, ''];

  // Group by project
  const byProject = new Map<string, any[]>();
  logs.forEach((l: any) => {
    const arr = byProject.get(l.project_name) || [];
    arr.push(l);
    byProject.set(l.project_name, arr);
  });

  byProject.forEach((logList, projectName) => {
    output.push(`── ${projectName} ──`);
    output.push('');

    logList.forEach((l: any) => {
      const d = new Date(l.log_date + 'T12:00:00');
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];

      output.push(`  📅 ${dayName} ${l.log_date}`);
      output.push(`     Weather: ${l.weather || 'N/A'} | ${l.temperature_high || '?'}°F / ${l.temperature_low || '?'}°F`);
      output.push(`     Crew: ${l.crew_count} on site`);
      output.push(`     Work: ${l.work_performed}`);

      if (l.materials_delivered) {
        output.push(`     📦 Materials: ${l.materials_delivered}`);
      }
      if (l.delays) {
        output.push(`     ⚠️ Delays: ${l.delays}`);
      }
      if (l.safety_incidents) {
        output.push(`     🚨 Safety: ${l.safety_incidents}`);
      }
      if (l.visitors) {
        output.push(`     👤 Visitors: ${l.visitors}`);
      }
      if (l.superintendent_notes) {
        output.push(`     📝 Superintendent: ${l.superintendent_notes}`);
      }

      output.push('');
    });
  });

  return output.join('\n');
}
