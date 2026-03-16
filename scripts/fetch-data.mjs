#!/usr/bin/env node

/**
 * Data pipeline: fetches Parcoursup formation data from the open data API
 * and produces public/data/formations.json for the app.
 *
 * Usage: node scripts/fetch-data.mjs [--session 2025]
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'data');

const BASE = 'https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets';
const DATASET = 'fr-esr-parcoursup';

const FIELDS = [
  'session',
  'g_ea_lib_vx',
  'cod_uai',
  'ville_etab',
  'dep',
  'dep_lib',
  'acad_mies',
  'region_etab_aff',
  'g_olocalisation_des_formations',
  'contrat_etab',
  'fili',
  'fil_lib_voe_acc',
  'form_lib_voe_acc',
  'detail_forma',
  'select_form',
  'voe_tot',
  'nb_voe_pp',
  'prop_tot',
  'acc_tot',
  'acc_tot_f',
  'capa_fin',
  'taux_acces_ens',
  'pct_neobac',
  'pct_bg',
  'pct_bt',
  'pct_bp',
  'pct_f',
  'pct_bours',
  'pct_mention_nonrenseignee',
  'pct_sansmention',
  'pct_ab',
  'pct_b',
  'pct_tb',
  'pct_tbf',
  'lien_form_psup',
];

// --- Helpers ---

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function mapType(fili, filLib) {
  const f = (fili || '').toLowerCase();
  const lib = (filLib || '').toLowerCase();

  if (f.includes('licence') || lib.includes('licence')) return 'Licence';
  if (f.includes('bts') || lib.includes('bts')) return 'BTS';
  if (f.includes('but') || f.includes('dut') || lib.includes('but') || lib.includes('dut')) return 'BUT';
  if (f.includes('cpge') || lib.includes('cpge') || lib.includes('classe préparatoire')) return 'CPGE';
  if (f.includes('ingénieur') || lib.includes('ingénieur') || lib.includes("école d'ingénieur")) return 'Ingenieur';
  if (f.includes('commerce') || lib.includes('commerce') || lib.includes('management') || lib.includes("école de commerce")) return 'Commerce';
  if (f.includes('ifsi') || lib.includes('ifsi') || lib.includes('infirmier') || lib.includes('santé') || lib.includes('médecine') || lib.includes('pass') || lib.includes('l.as')) return 'IFSI';
  return 'Autres';
}

/** Detect the latest session available */
async function detectLatestSession() {
  const url = `${BASE}/${DATASET}/records?select=session&group_by=session&order_by=session%20desc&limit=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Cannot detect latest session: ${res.status}`);
  const data = await res.json();
  if (!data.results?.length) throw new Error('No sessions found');
  return String(data.results[0].session);
}

/** Bulk export via /exports/json endpoint — no 10K limit */
async function fetchAllRecords(session) {
  const params = new URLSearchParams();
  params.set('where', `session=${session}`);
  params.set('select', FIELDS.join(','));

  const url = `${BASE}/${DATASET}/exports/json?${params}`;
  console.log(`  Fetching bulk export for session ${session}...`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);

  const records = await res.json();
  console.log(`  -> ${records.length} records fetched`);
  return records;
}

// --- Main ---

async function main() {
  const session = process.argv.includes('--session')
    ? process.argv[process.argv.indexOf('--session') + 1]
    : await detectLatestSession();

  console.log(`\nFetching Parcoursup data for session ${session}...\n`);

  const raw = await fetchAllRecords(session);

  console.log('\nTransforming...');

  const formations = [];
  let skippedNoGeo = 0;

  for (const r of raw) {
    const geo = r.g_olocalisation_des_formations;
    let lat = null;
    let lng = null;

    if (geo) {
      if (typeof geo === 'object' && geo.lat != null && geo.lon != null) {
        lat = parseFloat(geo.lat);
        lng = parseFloat(geo.lon);
      } else if (typeof geo === 'object' && geo.latitude != null && geo.longitude != null) {
        lat = parseFloat(geo.latitude);
        lng = parseFloat(geo.longitude);
      }
    }

    if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      skippedNoGeo++;
      continue;
    }

    const selectForm = (r.select_form || '').toLowerCase();
    const selective = selectForm.includes('sélective') && !selectForm.includes('non sélective');

    formations.push({
      uai: r.cod_uai || '',
      etab: r.g_ea_lib_vx || '',
      ville: r.ville_etab || '',
      dep: r.dep || '',
      depLib: r.dep_lib || '',
      academie: r.acad_mies || '',
      region: r.region_etab_aff || '',
      lat,
      lng,
      contrat: r.contrat_etab || '',
      fili: r.fili || '',
      filLib: r.fil_lib_voe_acc || '',
      formLib: r.form_lib_voe_acc || '',
      detail: r.detail_forma || null,
      selective,
      voeux: num(r.voe_tot),
      voeuxPP: num(r.nb_voe_pp),
      propositions: num(r.prop_tot),
      acceptes: num(r.acc_tot),
      acceptesF: num(r.acc_tot_f),
      capacite: num(r.capa_fin),
      tauxAcces: num(r.taux_acces_ens),
      pctNeobac: num(r.pct_neobac),
      pctBG: num(r.pct_bg),
      pctBT: num(r.pct_bt),
      pctBP: num(r.pct_bp),
      pctF: num(r.pct_f),
      pctBours: num(r.pct_bours),
      mentions: {
        nr: num(r.pct_mention_nonrenseignee),
        sans: num(r.pct_sansmention),
        ab: num(r.pct_ab),
        b: num(r.pct_b),
        tb: num(r.pct_tb),
        tbf: num(r.pct_tbf),
      },
      lien: r.lien_form_psup || null,
      type: mapType(r.fili, r.fil_lib_voe_acc),
    });
  }

  console.log(`\n${formations.length} formations with geolocation`);
  console.log(`${skippedNoGeo} skipped (no geolocation)`);

  const output = {
    meta: {
      session: parseInt(session),
      generatedAt: new Date().toISOString(),
      total: formations.length,
    },
    formations,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, 'formations.json');
  writeFileSync(outPath, JSON.stringify(output));

  const sizeMB = (Buffer.byteLength(JSON.stringify(output)) / 1024 / 1024).toFixed(2);
  console.log(`\nWritten to ${outPath} (${sizeMB} MB)`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
