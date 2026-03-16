import { useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { Formation } from '../types';
import { FORMATION_COLORS, FORMATION_LABELS } from '../utils/colors';
import { tauxAccesColor } from '../utils/format';

// Fix default marker icons in bundled environments
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Props {
  formations: Formation[];
  onBoundsChange: (bounds: L.LatLngBounds) => void;
  onFormationSelect: (f: Formation) => void;
  hoveredFormation: Formation | null;
}

function createFormationIcon(type: Formation['type'], dimmed = false): L.DivIcon {
  const color = dimmed ? '#d1d5db' : FORMATION_COLORS[type];
  const opacity = dimmed ? '0.4' : '1';
  return L.divIcon({
    html: `<div style="
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: ${color};
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      opacity: ${opacity};
      transition: opacity 0.15s;
    "></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -9],
  });
}

function renderPopupHTML(f: Formation): string {
  const typeColor = FORMATION_COLORS[f.type];
  const tauxColor = tauxAccesColor(f.tauxAcces);
  const tauxStr = f.tauxAcces != null ? `${Math.round(f.tauxAcces)}%` : '--';
  const selectBadge = f.selective
    ? '<span style="background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:10px;font-size:10px;">Selective</span>'
    : '<span style="background:#d1fae5;color:#065f46;padding:1px 6px;border-radius:10px;font-size:10px;">Non selective</span>';

  return `
    <div style="min-width:220px;max-width:300px;font-family:Inter,system-ui,sans-serif;">
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:6px;">
        <span style="background:${typeColor};color:white;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:600;">${FORMATION_LABELS[f.type]}</span>
        ${selectBadge}
      </div>
      <div style="font-weight:600;font-size:12px;color:#1f2937;line-height:1.3;margin-bottom:3px;">${f.formLib}</div>
      <div style="font-size:11px;color:#9ca3af;margin-bottom:8px;">${f.etab} -- ${f.ville}</div>
      <div style="display:flex;gap:12px;padding:6px 0;border-top:1px solid #f3f4f6;">
        <div style="text-align:center;">
          <div style="font-size:16px;font-weight:700;color:${tauxColor};">${tauxStr}</div>
          <div style="font-size:9px;color:#9ca3af;">taux d'acces</div>
        </div>
        ${f.capacite != null ? `<div style="text-align:center;">
          <div style="font-size:16px;font-weight:700;color:#374151;">${f.capacite}</div>
          <div style="font-size:9px;color:#9ca3af;">places</div>
        </div>` : ''}
        ${f.voeux != null ? `<div style="text-align:center;">
          <div style="font-size:16px;font-weight:700;color:#374151;">${f.voeux.toLocaleString('fr-FR')}</div>
          <div style="font-size:9px;color:#9ca3af;">voeux</div>
        </div>` : ''}
      </div>
      <button
        onclick="window.__parcoursup_detail__=true"
        style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:8px;padding:7px 0;width:100%;background:#7c3aed;color:white;border-radius:8px;font-size:12px;font-weight:600;border:none;cursor:pointer;"
      >
        Voir details
      </button>
    </div>
  `;
}

function BoundsTracker({ onChange }: { onChange: (bounds: L.LatLngBounds) => void }) {
  const map = useMap();
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const handler = () => onChangeRef.current(map.getBounds());
    handler();
    map.on('moveend', handler);
    map.on('zoomend', handler);
    return () => {
      map.off('moveend', handler);
      map.off('zoomend', handler);
    };
  }, [map]);

  return null;
}

function MarkerLayer({
  formations,
  onFormationSelect,
  hoveredFormation,
}: {
  formations: Formation[];
  onFormationSelect: (f: Formation) => void;
  hoveredFormation: Formation | null;
}) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const formationMapRef = useRef<Map<string, Formation>>(new Map());
  const hoveredRef = useRef<Formation | null>(hoveredFormation);

  // Build a unique key for each formation
  const getKey = useCallback((f: Formation, idx: number) => `${f.uai}-${idx}`, []);

  // Indexed formations with stable keys
  const indexed = useMemo(() =>
    formations.map((f, i) => ({ f, key: getKey(f, i) })),
    [formations, getKey],
  );

  useEffect(() => {
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }

    const newMarkers = new Map<string, L.Marker>();
    const newFormationMap = new Map<string, Formation>();

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      disableClusteringAtZoom: 15,
    });

    for (const { f, key } of indexed) {
      if (!f.lat || !f.lng) continue;

      const icon = createFormationIcon(f.type);
      const marker = L.marker([f.lat, f.lng], { icon });

      marker.bindPopup(renderPopupHTML(f), { maxWidth: 320 });

      marker.on('popupopen', () => {
        // Listen for detail button click
        const handler = () => {
          if (window.__parcoursup_detail__) {
            window.__parcoursup_detail__ = false;
            marker.closePopup();
            onFormationSelect(f);
          }
        };
        // Small delay to let DOM update
        setTimeout(() => {
          const btn = marker.getPopup()?.getElement()?.querySelector('button');
          if (btn) {
            btn.addEventListener('click', handler);
          }
        }, 50);
      });

      newMarkers.set(key, marker);
      newFormationMap.set(key, f);
      cluster.addLayer(marker);
    }

    markersRef.current = newMarkers;
    formationMapRef.current = newFormationMap;
    clusterRef.current = cluster;
    map.addLayer(cluster);

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
      }
    };
  }, [map, indexed, onFormationSelect]);

  // Hover dimming
  useEffect(() => {
    hoveredRef.current = hoveredFormation;
    for (const [key, marker] of markersRef.current) {
      const f = formationMapRef.current.get(key);
      if (!f) continue;
      if (hoveredFormation === null) {
        marker.setIcon(createFormationIcon(f.type));
      } else {
        const dimmed = f !== hoveredFormation;
        marker.setIcon(createFormationIcon(f.type, dimmed));
      }
    }
    if (clusterRef.current) {
      clusterRef.current.refreshClusters();
    }
  }, [hoveredFormation]);

  return null;
}

export function MapView({ formations, onBoundsChange, onFormationSelect, hoveredFormation }: Props) {
  return (
    <MapContainer
      center={[46.6, 2.5]}
      zoom={6}
      className="h-full w-full"
      zoomControl={false}
      minZoom={3}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <BoundsTracker onChange={onBoundsChange} />
      <MarkerLayer
        formations={formations}
        onFormationSelect={onFormationSelect}
        hoveredFormation={hoveredFormation}
      />
    </MapContainer>
  );
}

// Global declaration for popup detail button communication
declare global {
  interface Window {
    __parcoursup_detail__?: boolean;
  }
}
