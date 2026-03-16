import type { Formation } from '../types';
import { FORMATION_COLORS, FORMATION_LABELS } from '../utils/colors';
import { formatPct, formatNum, tauxAccesColor } from '../utils/format';

interface Props {
  formation: Formation;
  onClose: () => void;
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold" style={color ? { color } : undefined}>
        {value}
      </span>
    </div>
  );
}

function MentionBar({ mentions }: { mentions: Formation['mentions'] }) {
  const values = [
    { key: 'tbf', label: 'TB-F', value: mentions.tbf, color: '#7c3aed' },
    { key: 'tb', label: 'TB', value: mentions.tb, color: '#8b5cf6' },
    { key: 'b', label: 'B', value: mentions.b, color: '#10b981' },
    { key: 'ab', label: 'AB', value: mentions.ab, color: '#f59e0b' },
    { key: 'sans', label: 'Sans', value: mentions.sans, color: '#9ca3af' },
    { key: 'nr', label: 'NR', value: mentions.nr, color: '#d1d5db' },
  ].filter((v) => v.value != null && v.value > 0);

  const total = values.reduce((sum, v) => sum + (v.value ?? 0), 0);
  if (total === 0) return <div className="text-xs text-gray-400">Donnees non disponibles</div>;

  return (
    <div>
      <div className="mb-1 flex h-5 overflow-hidden rounded-full">
        {values.map((v) => (
          <div
            key={v.key}
            style={{
              width: `${((v.value ?? 0) / total) * 100}%`,
              background: v.color,
              minWidth: (v.value ?? 0) > 0 ? '2px' : 0,
            }}
            title={`${v.label}: ${formatPct(v.value)}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {values.map((v) => (
          <div key={v.key} className="flex items-center gap-1 text-[10px]">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: v.color }}
            />
            <span className="text-gray-500">{v.label}</span>
            <span className="font-semibold text-gray-700">{formatPct(v.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileBar({ formation }: { formation: Formation }) {
  const items = [
    { label: 'Bac general', value: formation.pctBG, color: '#8b5cf6' },
    { label: 'Bac techno', value: formation.pctBT, color: '#f59e0b' },
    { label: 'Bac pro', value: formation.pctBP, color: '#10b981' },
  ].filter((v) => v.value != null && v.value > 0);

  const total = items.reduce((sum, v) => sum + (v.value ?? 0), 0);
  if (total === 0) return <div className="text-xs text-gray-400">Donnees non disponibles</div>;

  return (
    <div>
      <div className="mb-1 flex h-5 overflow-hidden rounded-full">
        {items.map((v) => (
          <div
            key={v.label}
            style={{
              width: `${((v.value ?? 0) / total) * 100}%`,
              background: v.color,
              minWidth: (v.value ?? 0) > 0 ? '2px' : 0,
            }}
            title={`${v.label}: ${formatPct(v.value)}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {items.map((v) => (
          <div key={v.label} className="flex items-center gap-1 text-[10px]">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: v.color }}
            />
            <span className="text-gray-500">{v.label}</span>
            <span className="font-semibold text-gray-700">{formatPct(v.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormationDetail({ formation, onClose }: Props) {
  const typeColor = FORMATION_COLORS[formation.type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-5 py-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-2 flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
              style={{ background: typeColor }}
            >
              {FORMATION_LABELS[formation.type]}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                formation.selective
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {formation.selective ? 'Selective' : 'Non selective'}
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
              {formation.contrat}
            </span>
          </div>

          <h2 className="pr-8 text-base font-bold text-gray-900">{formation.formLib}</h2>
          {formation.detail && (
            <div className="mt-0.5 text-xs text-gray-500">{formation.detail}</div>
          )}
          <div className="mt-1 text-xs text-gray-500">
            {formation.etab} -- {formation.ville} ({formation.depLib})
          </div>
        </div>

        {/* Body */}
        <div className="space-y-5 px-5 py-4">
          {/* Key stats */}
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Chiffres cles
            </h3>
            <div className="divide-y divide-gray-50">
              <StatRow
                label="Taux d'acces"
                value={formatPct(formation.tauxAcces)}
                color={tauxAccesColor(formation.tauxAcces)}
              />
              <StatRow label="Capacite" value={formatNum(formation.capacite)} />
              <StatRow label="Voeux formules" value={formatNum(formation.voeux)} />
              <StatRow label="Voeux phase principale" value={formatNum(formation.voeuxPP)} />
              <StatRow label="Propositions d'admission" value={formatNum(formation.propositions)} />
              <StatRow label="Admis" value={formatNum(formation.acceptes)} />
            </div>
          </div>

          {/* Profile */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Profil des admis
            </h3>
            <div className="divide-y divide-gray-50">
              <StatRow label="Neo-bacheliers" value={formatPct(formation.pctNeobac)} />
              <StatRow label="Femmes" value={formatPct(formation.pctF)} />
              <StatRow label="Boursiers" value={formatPct(formation.pctBours)} />
            </div>
          </div>

          {/* Bac type breakdown */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Type de bac des admis
            </h3>
            <ProfileBar formation={formation} />
          </div>

          {/* Mentions */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Mentions au bac des admis
            </h3>
            <MentionBar mentions={formation.mentions} />
          </div>

          {/* Parcoursup link */}
          {formation.lien && (
            <a
              href={formation.lien}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-violet-700"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Voir sur Parcoursup
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
