# Carte Parcoursup

Carte interactive des formations superieures avec donnees d'admission Parcoursup.

## Fonctionnalites

- Carte Leaflet avec 14 000+ formations et marker clustering par type
- 8 filtres par type de formation : Licence, BTS, BUT, CPGE, Ingenieur, Commerce, IFSI, Autres
- Filtre par selectivite et secteur (public/prive)
- Recherche textuelle sur les formations
- Sidebar triable avec liste des formations
- Fiche detail avec repartition des mentions au bac et types de bac
- Lien direct vers la fiche Parcoursup de chaque formation
- Donnees DOM-TOM incluses (688 formations outre-mer)

## Sources de donnees

| Source | API / URL | Frequence |
|--------|-----------|-----------|
| Parcoursup (session 2025) | data.enseignementsup-recherche.gouv.fr (Opendatasoft API, dataset `fr-esr-parcoursup`) | Annuelle |

Donnees consolidees dans `public/data/formations.json`.

## Commandes

```bash
npm run dev          # Serveur de developpement Vite
npm run build        # Build de production (tsc + vite build)
npm run lint         # ESLint
npm run preview      # Preview du build

node scripts/fetch-data.mjs   # Rafraichir les donnees (auto-detection de la derniere session)
```

## Stack technique

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Leaflet / react-leaflet
- MarkerCluster

## Mise a jour automatique des donnees

GitHub Actions workflow executant `fetch-data.mjs` le 15 juin de chaque annee, date habituelle de publication des nouvelles donnees Parcoursup. Le fichier JSON mis a jour est commite automatiquement.

## Deploiement

GitHub Pages via GitHub Actions.
