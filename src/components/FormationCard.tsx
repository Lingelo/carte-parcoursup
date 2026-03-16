import type { Formation } from '../types';
import { FORMATION_COLORS, FORMATION_LABELS } from '../utils/colors';
import { formatPct, truncate, tauxAccesColor } from '../utils/format';

interface Props {
  formation: Formation;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  selected: boolean;
}

export function FormationCard({ formation, onClick, onHover, selected }: Props) {
  const color = FORMATION_COLORS[formation.type];
  const tauxColor = tauxAccesColor(formation.tauxAcces);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`w-full rounded-lg border px-3 py-2.5 text-left transition-all hover:shadow-md ${
        selected
          ? 'border-violet-300 bg-violet-50 shadow-md'
          : 'border-gray-100 bg-white hover:border-gray-200'
      }`}
    >
      {/* Type badge + selectivity */}
      <div className="mb-1.5 flex items-center gap-1.5">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
          style={{ background: color }}
        >
          {FORMATION_LABELS[formation.type]}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            formation.selective
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {formation.selective ? 'Selective' : 'Non selective'}
        </span>
      </div>

      {/* Formation name */}
      <div className="text-xs font-semibold leading-tight text-gray-800">
        {truncate(formation.formLib, 80)}
      </div>

      {/* Establishment + city */}
      <div className="mt-0.5 text-[11px] text-gray-500">
        {truncate(formation.etab, 50)} -- {formation.ville}
      </div>

      {/* Key metrics */}
      <div className="mt-2 flex items-center gap-3 text-[11px]">
        <div className="flex items-center gap-1">
          <span className="font-semibold" style={{ color: tauxColor }}>
            {formatPct(formation.tauxAcces)}
          </span>
          <span className="text-gray-400">acces</span>
        </div>
        {formation.capacite != null && (
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-600">{formation.capacite}</span>
            <span className="text-gray-400">places</span>
          </div>
        )}
        {formation.voeux != null && (
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-600">{formation.voeux.toLocaleString('fr-FR')}</span>
            <span className="text-gray-400">voeux</span>
          </div>
        )}
      </div>
    </button>
  );
}
