export type FormationType =
  | 'Licence'
  | 'BTS'
  | 'BUT'
  | 'CPGE'
  | 'Ingenieur'
  | 'Commerce'
  | 'IFSI'
  | 'Autres';

export type Selectivite = 'selective' | 'non_selective' | 'toutes';
export type Secteur = 'public' | 'prive' | 'tous';

export interface Formation {
  /** UAI code */
  uai: string;
  /** Establishment name */
  etab: string;
  /** City */
  ville: string;
  /** Department code */
  dep: string;
  /** Department name */
  depLib: string;
  /** Academy */
  academie: string;
  /** Region */
  region: string;
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
  /** Public or private */
  contrat: string;
  /** Formation type category */
  fili: string;
  /** Formation category label */
  filLib: string;
  /** Detailed formation name */
  formLib: string;
  /** Specialty details */
  detail: string | null;
  /** Selectivity */
  selective: boolean;
  /** Total wishes (candidatures) */
  voeux: number | null;
  /** Wishes in main phase */
  voeuxPP: number | null;
  /** Total proposals made */
  propositions: number | null;
  /** Total accepted */
  acceptes: number | null;
  /** Accepted females */
  acceptesF: number | null;
  /** Final capacity */
  capacite: number | null;
  /** Overall access rate (%) */
  tauxAcces: number | null;
  /** % neo-bacheliers */
  pctNeobac: number | null;
  /** % bac general */
  pctBG: number | null;
  /** % bac techno */
  pctBT: number | null;
  /** % bac pro */
  pctBP: number | null;
  /** % females */
  pctF: number | null;
  /** % boursiers */
  pctBours: number | null;
  /** Mention breakdown */
  mentions: {
    nr: number | null;
    sans: number | null;
    ab: number | null;
    b: number | null;
    tb: number | null;
    tbf: number | null;
  };
  /** Link to Parcoursup page */
  lien: string | null;
  /** Mapped formation type */
  type: FormationType;
}

export interface FormationData {
  meta: {
    session: number;
    generatedAt: string;
    total: number;
  };
  formations: Formation[];
}

export interface Filters {
  search: string;
  types: FormationType[];
  selectivite: Selectivite;
  secteur: Secteur;
}
