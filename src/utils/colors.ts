import type { FormationType } from '../types';

export const FORMATION_COLORS: Record<FormationType, string> = {
  Licence: '#8b5cf6',
  BTS: '#f59e0b',
  BUT: '#10b981',
  CPGE: '#ef4444',
  Ingenieur: '#3b82f6',
  Commerce: '#f97316',
  IFSI: '#ec4899',
  Autres: '#6b7280',
};

export const FORMATION_LABELS: Record<FormationType, string> = {
  Licence: 'Licence',
  BTS: 'BTS',
  BUT: 'BUT (ex-DUT)',
  CPGE: 'CPGE',
  Ingenieur: 'Ecole d\'ingenieur',
  Commerce: 'Ecole de commerce',
  IFSI: 'IFSI / Sante',
  Autres: 'Autres',
};

export const ALL_FORMATION_TYPES: FormationType[] = [
  'Licence',
  'BTS',
  'BUT',
  'CPGE',
  'Ingenieur',
  'Commerce',
  'IFSI',
  'Autres',
];
