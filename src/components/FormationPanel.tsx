import { useMemo, useState } from 'react';
import type { Formation } from '../types';
import { FormationCard } from './FormationCard';

type SortKey = 'tauxAcces' | 'voeux' | 'capacite';

interface Props {
  formations: Formation[];
  onSelect: (f: Formation) => void;
  selectedUai: string | null;
  selectedFormLib: string | null;
  onHover: (f: Formation | null) => void;
}

export function FormationPanel({ formations, onSelect, selectedUai, selectedFormLib, onHover }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('tauxAcces');

  const sorted = useMemo(() => {
    return [...formations].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      // For tauxAcces, most selective (lowest) first
      if (sortKey === 'tauxAcces') return (av as number) - (bv as number);
      // For voeux/capacite, highest first
      return (bv as number) - (av as number);
    });
  }, [formations, sortKey]);

  // Limit to 200 for performance
  const display = sorted.slice(0, 200);

  return (
    <div className="flex h-full flex-col">
      {/* Sort controls */}
      <div className="flex items-center gap-1 border-b border-gray-100 px-3 py-2">
        <span className="text-[10px] text-gray-400">Trier :</span>
        {([
          ['tauxAcces', 'Selectivite'],
          ['voeux', 'Voeux'],
          ['capacite', 'Places'],
        ] as [SortKey, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSortKey(key)}
            className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
              sortKey === key
                ? 'bg-violet-100 text-violet-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-gray-400">
          {formations.length} formation{formations.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Formation list */}
      <div className="panel-scroll flex-1 overflow-y-auto p-2">
        {display.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-400">
            Aucune formation visible
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {display.map((f, i) => (
              <FormationCard
                key={`${f.uai}-${f.formLib}-${i}`}
                formation={f}
                onClick={() => onSelect(f)}
                onHover={(h) => onHover(h ? f : null)}
                selected={f.uai === selectedUai && f.formLib === selectedFormLib}
              />
            ))}
            {sorted.length > 200 && (
              <div className="py-2 text-center text-[10px] text-gray-400">
                {sorted.length - 200} formations supplementaires non affichees. Zoomez ou filtrez pour affiner.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
