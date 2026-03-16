import type { Filters as FiltersType, FormationType, Selectivite, Secteur } from '../types';
import { FORMATION_COLORS, FORMATION_LABELS, ALL_FORMATION_TYPES } from '../utils/colors';

interface Props {
  filters: FiltersType;
  onToggleType: (type: FormationType) => void;
  onSelectivite: (s: Selectivite) => void;
  onSecteur: (s: Secteur) => void;
  totalCount: number;
  filteredCount: number;
}

export function Filters({
  filters,
  onToggleType,
  onSelectivite,
  onSecteur,
  totalCount,
  filteredCount,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      {/* Formation type chips */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_FORMATION_TYPES.map((type) => {
          const active = filters.types.length === 0 || filters.types.includes(type);
          const color = FORMATION_COLORS[type];
          return (
            <button
              key={type}
              onClick={() => onToggleType(type)}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all"
              style={{
                background: active ? color : '#f3f4f6',
                color: active ? 'white' : '#6b7280',
                opacity: active ? 1 : 0.6,
              }}
            >
              {FORMATION_LABELS[type]}
            </button>
          );
        })}
      </div>

      {/* Selectivity + Sector + Count */}
      <div className="flex items-center gap-2 text-xs">
        <select
          value={filters.selectivite}
          onChange={(e) => onSelectivite(e.target.value as Selectivite)}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-gray-600 outline-none"
        >
          <option value="toutes">Toutes</option>
          <option value="selective">Selectives</option>
          <option value="non_selective">Non selectives</option>
        </select>

        <select
          value={filters.secteur}
          onChange={(e) => onSecteur(e.target.value as Secteur)}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-gray-600 outline-none"
        >
          <option value="tous">Public & Prive</option>
          <option value="public">Public</option>
          <option value="prive">Prive</option>
        </select>

        <span className="ml-auto text-gray-400">
          {filteredCount.toLocaleString('fr-FR')} / {totalCount.toLocaleString('fr-FR')}
        </span>
      </div>
    </div>
  );
}
