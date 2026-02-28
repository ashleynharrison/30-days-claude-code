import { getEightySixStatus } from '../database.js';

export function eightySixStatus(): string {
  const data = getEightySixStatus();

  const currentItems = (data.current as any[]);
  const history = (data.recentHistory as any[]);

  const currentSection = currentItems.length > 0
    ? currentItems.map((item: any) => [
        `  🚫 ${item.name} (${item.category})`,
        `     Reason: ${item.reason}`,
        `     Pulled: ${item.eighty_sixed_at}${item.pulled_by ? ` by ${item.pulled_by}` : ''}`,
      ].join('\n')).join('\n\n')
    : '  All items available ✓';

  const historySection = history.length > 0
    ? history.map((item: any) => [
        `  ${item.name} — ${item.reason}`,
        `  Pulled: ${item.eighty_sixed_at} → Restored: ${item.restored_at}${item.pulled_by ? ` (by ${item.pulled_by})` : ''}`,
      ].join('\n')).join('\n\n')
    : '  No recent history';

  return [
    `═══ 86'D STATUS ═══`,
    '',
    `Currently Unavailable (${currentItems.length} item${currentItems.length !== 1 ? 's' : ''}):`,
    currentSection,
    '',
    'Recently Restored:',
    historySection,
  ].join('\n');
}
