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

/** Selectivity label */
export function selectiviteLabel(selective: boolean): string {
  return selective ? 'Selective' : 'Non selective';
}
