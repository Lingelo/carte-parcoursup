import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FormationData, Filters, FormationType } from '../types';

const DATA_URL = `${import.meta.env.BASE_URL}data/formations.json`;

function mapFormationType(fili: string, filLib: string): FormationType {
  const f = fili?.toLowerCase() ?? '';
  const lib = filLib?.toLowerCase() ?? '';

  if (f.includes('licence') || lib.includes('licence')) return 'Licence';
  if (f.includes('bts') || lib.includes('bts')) return 'BTS';
  if (f.includes('but') || f.includes('dut') || lib.includes('but') || lib.includes('dut')) return 'BUT';
  if (f.includes('cpge') || lib.includes('cpge') || lib.includes('classe préparatoire')) return 'CPGE';
  if (f.includes('ingénieur') || lib.includes('ingénieur') || lib.includes('école d\'ingénieur')) return 'Ingenieur';
  if (f.includes('commerce') || lib.includes('commerce') || lib.includes('management') || lib.includes('école de commerce')) return 'Commerce';
  if (f.includes('ifsi') || lib.includes('ifsi') || lib.includes('infirmier') || lib.includes('santé') || lib.includes('médecine') || lib.includes('pass') || lib.includes('l.as')) return 'IFSI';
  return 'Autres';
}

export function useFormations() {
  const [data, setData] = useState<FormationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    types: [],
    selectivite: 'toutes',
    secteur: 'tous',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(DATA_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json() as FormationData;

        // Map types if not already mapped
        for (const f of json.formations) {
          if (!f.type) {
            f.type = mapFormationType(f.fili, f.filLib);
          }
        }

        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur de chargement');
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];

    let result = data.formations;

    // Text search
    if (filters.search.trim()) {
      const terms = filters.search.toLowerCase().trim().split(/\s+/);
      result = result.filter((f) => {
        const haystack = `${f.formLib} ${f.etab} ${f.ville} ${f.detail ?? ''}`.toLowerCase();
        return terms.every((t) => haystack.includes(t));
      });
    }

    // Formation type filter
    if (filters.types.length > 0) {
      result = result.filter((f) => filters.types.includes(f.type));
    }

    // Selectivity filter
    if (filters.selectivite === 'selective') {
      result = result.filter((f) => f.selective);
    } else if (filters.selectivite === 'non_selective') {
      result = result.filter((f) => !f.selective);
    }

    // Sector filter
    if (filters.secteur === 'public') {
      result = result.filter((f) => f.contrat.toLowerCase().includes('public'));
    } else if (filters.secteur === 'prive') {
      result = result.filter((f) => f.contrat.toLowerCase().includes('priv'));
    }

    return result;
  }, [data, filters]);

  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleType = useCallback((type: FormationType) => {
    setFilters((prev) => {
      const types = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type];
      return { ...prev, types };
    });
  }, []);

  return {
    formations: filtered,
    allFormations: data?.formations ?? [],
    meta: data?.meta ?? null,
    loading,
    error,
    filters,
    updateFilter,
    toggleType,
  };
}
