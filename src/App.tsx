import { useState, useCallback, useMemo } from 'react';
import type { LatLngBounds } from 'leaflet';
import type { Formation } from './types';
import { useFormations } from './hooks/useFormations';
import { MapView } from './components/MapView';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { Filters } from './components/Filters';
import { FormationPanel } from './components/FormationPanel';
import { FormationDetail } from './components/FormationDetail';

export default function App() {
  const {
    formations,
    allFormations,
    meta,
    loading,
    error,
    filters,
    updateFilter,
    toggleType,
  } = useFormations();

  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [hoveredFormation, setHoveredFormation] = useState<Formation | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Formations with valid geolocation
  const geoFormations = useMemo(
    () => formations.filter((f) => f.lat && f.lng),
    [formations],
  );

  // Formations visible in map viewport
  const visibleFormations = useMemo(() => {
    if (!mapBounds) return geoFormations;
    return geoFormations.filter((f) =>
      mapBounds.contains([f.lat, f.lng]),
    );
  }, [geoFormations, mapBounds]);

  const handleBoundsChange = useCallback((bounds: LatLngBounds) => {
    setMapBounds(bounds);
  }, []);

  const handleFormationSelect = useCallback((f: Formation) => {
    setSelectedFormation(f);
  }, []);

  const handleSearch = useCallback((value: string) => {
    updateFilter('search', value);
  }, [updateFilter]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Map */}
      <MapView
        formations={geoFormations}
        onBoundsChange={handleBoundsChange}
        onFormationSelect={handleFormationSelect}
        hoveredFormation={hoveredFormation}
      />

      {/* Top overlay: header + search + filters */}
      <div className="absolute left-0 right-0 top-0 z-10 p-3 md:p-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          {/* Header row */}
          <div className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-2 shadow-lg">
            <Header />
            <div className="hidden text-xs text-gray-400 md:block">
              {meta && `Session ${meta.session}`}
            </div>
          </div>

          {/* Search */}
          <SearchBar value={filters.search} onChange={handleSearch} />

          {/* Filters */}
          <div className="glass rounded-xl px-3 py-2 shadow-md">
            <Filters
              filters={filters}
              onToggleType={toggleType}
              onSelectivite={(s) => updateFilter('selectivite', s)}
              onSecteur={(s) => updateFilter('secteur', s)}
              totalCount={allFormations.length}
              filteredCount={formations.length}
            />
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <div className="glass rounded-xl px-6 py-3 shadow-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Chargement des formations...
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <div className="rounded-xl bg-red-50 px-6 py-3 text-sm text-red-600 shadow-lg">
            {error}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-2 left-2 z-10 hidden items-center gap-2 rounded-lg bg-white/80 px-3 py-1.5 text-[11px] text-gray-500 shadow-sm backdrop-blur-sm md:flex">
        <span>Donnees Parcoursup (data.enseignementsup-recherche.gouv.fr)</span>
        {meta && (
          <>
            <span className="text-gray-300">|</span>
            <span>Session {meta.session}</span>
            <span className="text-gray-300">|</span>
            <span>{meta.total.toLocaleString('fr-FR')} formations</span>
          </>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="absolute bottom-0 right-0 top-0 z-10 hidden w-80 border-l border-gray-200 bg-white shadow-xl md:block">
        <FormationPanel
          formations={visibleFormations}
          onSelect={handleFormationSelect}
          selectedUai={selectedFormation?.uai ?? null}
          selectedFormLib={selectedFormation?.formLib ?? null}
          onHover={setHoveredFormation}
        />
      </div>

      {/* Mobile bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-10 md:hidden">
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="glass flex w-full items-center justify-between rounded-t-2xl px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
        >
          <span className="text-sm font-semibold text-gray-700">
            {visibleFormations.length} formation{visibleFormations.length > 1 ? 's' : ''} visibles
          </span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${panelOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        {panelOpen && (
          <div className="h-64 bg-white">
            <FormationPanel
              formations={visibleFormations}
              onSelect={handleFormationSelect}
              selectedUai={selectedFormation?.uai ?? null}
              selectedFormLib={selectedFormation?.formLib ?? null}
              onHover={setHoveredFormation}
            />
          </div>
        )}
      </div>

      {/* Formation detail modal */}
      {selectedFormation && (
        <FormationDetail
          formation={selectedFormation}
          onClose={() => setSelectedFormation(null)}
        />
      )}
    </div>
  );
}
