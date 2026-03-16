/** Format a percentage value for display */
export function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return '--';
  return `${Math.round(value)}%`;
}

/** Format a number with French locale */
export function formatNum(value: number | null | undefined): string {
  if (value === null || value === undefined) return '--';
  return value.toLocaleString('fr-FR');
}

/** Truncate text to maxLen characters */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + '\u2026';
}

/** Access rate color: green for accessible, red for selective */
export function tauxAccesColor(taux: number | null): string {
  if (taux === null) return '#6b7280';
  if (taux >= 80) return '#16a34a';
  if (taux >= 50) return '#f59e0b';
  if (taux >= 25) return '#f97316';
  return '#dc2626';
}

/** French relative time string from ISO date */
export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `il y a ${mins} minute${mins > 1 ? 's' : ''}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  const months = Math.floor(days / 30);
  return `il y a ${months} mois`;
}

/** Selectivity label */
export function selectiviteLabel(selective: boolean): string {
  return selective ? 'Selective' : 'Non selective';
}
