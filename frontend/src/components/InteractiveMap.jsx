import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import { Trash2, Truck, AlertTriangle, MapPin, Circle, Wrench, Info, Droplet, User, Gauge, Fuel, Clock } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Fix leaflet icon bundling ─────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ── Fixed: use useMapEvents hook instead of map.on() inside useEffect ────────
const MapEvents = ({ onMapClick, onZoom }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    zoomend: () => {
      if (onZoom) onZoom();
    },
  });
  return null;
};

// ── Fixed: ChangeMapView using stable ref to avoid calling setView during render
const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  const prevCenter = useRef(null);
  const prevZoom   = useRef(null);

  useEffect(() => {
    if (!center || !center[0] || !center[1]) return;
    const [lat, lng] = center;
    if (
      prevCenter.current?.[0] !== lat ||
      prevCenter.current?.[1] !== lng ||
      prevZoom.current !== zoom
    ) {
      map.setView(center, zoom, { animate: true });
      prevCenter.current = center;
      prevZoom.current   = zoom;
    }
  }, [center, zoom, map]);

  return null;
};

const InvalidateMapSize = () => {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to safely invalidate size after layouts settle
      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    });

    resizeObserver.observe(container);

    // Initial triggers
    map.invalidateSize();
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [map]);

  return null;
};

// ── Icon factories ─────────────────────────────────────────────────────────────
const createBinIcon = (fillLevel, status) => {
  let color, pulse;
  if (fillLevel >= 75 || status === 'Overflowing') {
    color = '#ef4444'; pulse = 'pulse-warning';
  } else if (fillLevel >= 50) {
    color = '#f59e0b'; pulse = '';
  } else {
    color = '#10b981'; pulse = '';
  }

  return L.divIcon({
    className: `custom-div-icon ${pulse}`,
    html: `<div style="
      width:26px; height:26px;
      border-radius:50%;
      background:${color};
      border:2px solid rgba(255,255,255,0.95);
      box-shadow:0 0 10px ${color}, 0 2px 4px rgba(0,0,0,0.25);
      display:flex; align-items:center; justify-content:center;
      color:white;
      cursor:pointer;
      transition: transform 0.15s ease;
    " onmouseover="this.style.transform='scale(1.08)';" onmouseout="this.style.transform='scale(1)';">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 7h16" />
        <path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
        <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
        <path d="M9 15h6" />
      </svg>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  });
};

const createVehicleIcon = (status) => {
  const color = status === 'Active' ? '#0ea5e9' : '#6b7280';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      width:26px; height:26px;
      border-radius:50%;
      background:${color};
      border:2px solid rgba(255,255,255,0.95);
      box-shadow:0 0 10px ${color}, 0 2px 4px rgba(0,0,0,0.25);
      display:flex; align-items:center; justify-content:center;
      color:white;
      cursor:pointer;
      transition: transform 0.15s ease;
    " onmouseover="this.style.transform='scale(1.08)';" onmouseout="this.style.transform='scale(1)';">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 13h14l3 5H5a2 2 0 0 1-2-2v-3z" />
        <path d="M6 13V8a2 2 0 0 1 2-2h8" />
        <circle cx="7" cy="19" r="1.5" />
        <circle cx="17" cy="19" r="1.5" />
      </svg>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  });
};

const getReportTypeAndStyle = (description = '') => {
  return { symbol: '⚠️', color: '#f59e0b' };
};

const createReportIcon = (description) => {
  const { color } = getReportTypeAndStyle(description);
  return L.divIcon({
    className: 'custom-div-icon pulse-warning',
    html: `<div style="
      width:26px; height:26px;
      border-radius:50%;
      background:#ffffff;
      border:2px solid ${color};
      box-shadow:0 0 10px ${color}, 0 2px 4px rgba(0,0,0,0.15);
      display:flex; align-items:center; justify-content:center;
      cursor:pointer;
      transition: transform 0.15s ease;
    " onmouseover="this.style.transform='scale(1.08)';" onmouseout="this.style.transform='scale(1)';">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
        <path d="M9 3h6l4 4v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7l4-4z" />
      </svg>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  });
};

// Numbered step marker for active route waypoints
const createWaypointStepIcon = (stepNumber, isNext) => {
  const bg = isNext ? '#0ea5e9' : '#0f766e';
  const glow = isNext ? '0 0 12px rgba(14,165,233,0.6)' : '0 0 6px rgba(15,118,110,0.3)';
  const size = isNext ? 24 : 20;
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:${bg};
      border:2px solid white;
      box-shadow:${glow};
      display:flex; align-items:center; justify-content:center;
      color:white;
      font-size:${isNext ? 11 : 10}px;
      font-weight:900;
      font-family:'Inter','Outfit',sans-serif;
      line-height:1;
      ${isNext ? 'animation: pulse-step 1.5s infinite;' : ''}
    ">${stepNumber}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Depot / start-end icon
const depotIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="
    width:28px; height:28px;
    border-radius:50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border:2.5px solid white;
    box-shadow:0 0 12px rgba(99,102,241,0.5), 0 2px 6px rgba(0,0,0,0.2);
    display:flex; align-items:center; justify-content:center;
    color:white;
  "><svg viewBox='0 0 24 24' width='14' height='14' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const dumpYardIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="
    width:30px; height:30px;
    border-radius:50%;
    background: linear-gradient(135deg, #f59e0b, #fde68a);
    border:3px solid white;
    box-shadow:0 0 12px rgba(245,158,11,0.5), 0 2px 6px rgba(0,0,0,0.2);
    display:flex; align-items:center; justify-content:center;
    color:#7c2d12;
  "><svg viewBox='0 0 24 24' width='14' height='14' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'><path d='M4 7h16' /><path d='M7 7v10' /><path d='M10 7v10' /><path d='M13 7v10' /><path d='M16 7v10' /></svg></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

const selectedLocationIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#06b6d4" stroke="#ffffff" stroke-width="1.2"
    style="width:34px;height:34px;filter:drop-shadow(0 0 6px rgba(6,182,212,0.8));">
    <path fill-rule="evenodd"
      d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.961 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
      clip-rule="evenodd" />
  </svg>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

// ── Map Legend overlay ─────────────────────────────────────────────────────────
const MapLegend = ({ showReports, showRoutes }) => {

  return (
    <div className="map-legend" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '5px',
      padding: '0.65rem 0.85rem',
      background: 'white',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      boxShadow: 'var(--shadow-md)',
      fontSize: '0.75rem',
      color: 'var(--text-secondary)'
    }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Map Legend</div>
      
      <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid white', boxShadow: '0 0 3px rgba(0,0,0,0.2)' }}>
          <Trash2 size={10} strokeWidth={2.2} />
        </div>
        <span>Bin — Low (&lt;50%)</span>
      </div>
      
      <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid white', boxShadow: '0 0 3px rgba(0,0,0,0.2)' }}>
          <Trash2 size={10} strokeWidth={2.2} />
        </div>
        <span>Bin — Medium (50–74%)</span>
      </div>
      
      <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid white', boxShadow: '0 0 3px rgba(0,0,0,0.2)' }}>
          <Trash2 size={10} strokeWidth={2.2} />
        </div>
        <span>Bin — Critical (≥75%)</span>
      </div>
      
      <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid white', boxShadow: '0 0 3px rgba(0,0,0,0.2)' }}>
          <Truck size={10} strokeWidth={2.2} />
        </div>
        <span>Collection Truck</span>
      </div>
      
      {showReports && (
        <>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)', marginTop: '0.4rem', marginBottom: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Citizen Reports</div>
          
          <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', border: '1.5px solid #f59e0b', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 3px rgba(0,0,0,0.2)' }}>
              <AlertTriangle size={10} strokeWidth={2.5} color="#f59e0b" />
            </div>
            <span>Citizen Issue / Report</span>
          </div>
        </>
      )}
      
      {showRoutes && (
        <>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)', marginTop: '0.4rem', marginBottom: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Route</div>
          
          <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 18, height: 6, borderRadius: '3px', background: '#3b82f6', border: '1px solid #1d4ed8', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
            <span>Active Route</span>
          </div>
          
          <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid white', color: 'white', fontSize: '8px', fontWeight: 900 }}>1</div>
            <span>Next Stop</span>
          </div>
          
          <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', opacity: 0.4, border: '1px solid #bbf7d0' }} />
            <span>Collected</span>
          </div>
        </>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const InteractiveMap = ({
  bins = [], vehicles = [], reports = [],
  activeRoute = null, onMapClick = null, selectedLocation = null, onClearLocation = null
}) => {
  const [zoomKey, setZoomKey] = useState(0);
  // Derive center from active route or first vehicle
  const mapCenter = (() => {
    if (activeRoute?.waypoints?.length > 0) {
      const first = activeRoute.waypoints[0];
      return [first.latitude, first.longitude];
    }
    if (vehicles.length > 0 && vehicles[0].latitude) {
      return [vehicles[0].latitude, vehicles[0].longitude];
    }
    return [30.7333, 76.7794]; // Chandigarh
  })();

  const mapZoom = activeRoute ? 14 : 13;

  // ── Build route data: separate collected vs remaining ──
  const assignedVehicle = activeRoute
    ? vehicles.find(v => v._id === activeRoute.vehicle?._id || v._id === activeRoute.vehicle)
    : null;

  const vehiclePos = assignedVehicle ? [assignedVehicle.latitude, assignedVehicle.longitude] : null;

  // Active pickup path: vehicle → uncollected waypoints along saved road geometry.
  const activeRoutePath = (() => {
    if (!activeRoute || activeRoute.status === 'Dumping' || activeRoute.status === 'Completed') return [];
    
    if (activeRoute.geometry && activeRoute.geometry.length > 0) {
      if (!vehiclePos) return activeRoute.geometry;
      
      // Find index in geometry closest to vehicle's current position
      let closestIdx = 0;
      let minGeomDist = Infinity;
      for (let i = 0; i < activeRoute.geometry.length; i++) {
        const pt = activeRoute.geometry[i];
        const distSq = (vehiclePos[0] - pt[0]) ** 2 + (vehiclePos[1] - pt[1]) ** 2;
        if (distSq < minGeomDist) {
          minGeomDist = distSq;
          closestIdx = i;
        }
      }

      const uncollected = activeRoute.waypoints.filter(wp => !wp.collected);
      if (uncollected.length === 0) return [];

      // Find the last uncollected waypoint along the geometry so we don't draw the extra return-to-depot leg.
      const lastUncollected = uncollected[uncollected.length - 1];
      let lastIdx = closestIdx;
      let minLastDist = Infinity;
      for (let i = closestIdx; i < activeRoute.geometry.length; i++) {
        const pt = activeRoute.geometry[i];
        const distSq = (lastUncollected.latitude - pt[0]) ** 2 + (lastUncollected.longitude - pt[1]) ** 2;
        if (distSq < minLastDist) {
          minLastDist = distSq;
          lastIdx = i;
        }
      }
      return activeRoute.geometry.slice(closestIdx, lastIdx + 1);
    }
    
    // Fallback: Straight line path
    const uncollected = activeRoute.waypoints.filter(wp => !wp.collected);
    if (uncollected.length === 0) return [];
    const path = [];
    if (vehiclePos) path.push(vehiclePos);
    uncollected.forEach(wp => path.push([wp.latitude, wp.longitude]));
    return path;
  })();

  // Active dump path: vehicle → dump yard along saved dump geometry (slices behind the truck)
  const activeDumpPath = (() => {
    if (!activeRoute || !activeRoute.dumpGeometry || activeRoute.dumpGeometry.length === 0) return [];
    if (activeRoute.status !== 'Dumping') return activeRoute.dumpGeometry;
    if (!vehiclePos) return activeRoute.dumpGeometry;

    let closestIdx = 0;
    let minGeomDist = Infinity;
    for (let i = 0; i < activeRoute.dumpGeometry.length; i++) {
      const pt = activeRoute.dumpGeometry[i];
      const distSq = (vehiclePos[0] - pt[0]) ** 2 + (vehiclePos[1] - pt[1]) ** 2;
      if (distSq < minGeomDist) {
        minGeomDist = distSq;
        closestIdx = i;
      }
    }
    return activeRoute.dumpGeometry.slice(closestIdx);
  })();

  // Uncollected waypoints with step numbers for markers
  const uncollectedSteps = activeRoute
    ? activeRoute.waypoints
        .map((wp, originalIdx) => ({ ...wp, originalIdx }))
        .filter(wp => !wp.collected)
        .map((wp, stepIdx) => ({ ...wp, stepNumber: stepIdx + 1 }))
    : [];

  const showReports = reports.some(r => r.status === 'Pending' || r.status === 'Dispatched');
  const showRoutes  = activeRoutePath.length > 0;

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-md)' }}
        zoomControl={true}
      >
        <ChangeMapView center={mapCenter} zoom={mapZoom} />
        <InvalidateMapSize />
        <MapEvents onMapClick={onMapClick} onZoom={() => setZoomKey(prev => prev + 1)} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ── Bins ── */}
        {bins.map(bin => {
          const fillColor = bin.fillLevel >= 75 ? '#ef4444' : bin.fillLevel >= 50 ? '#f59e0b' : '#10b981';
          const fillBg = bin.fillLevel >= 75 ? '#fef2f2' : bin.fillLevel >= 50 ? '#fffbeb' : '#f0fdf4';
          const fillBorder = bin.fillLevel >= 75 ? '#fecaca' : bin.fillLevel >= 50 ? '#fde68a' : '#bbf7d0';
          return (
          <Marker key={bin._id} position={[bin.latitude, bin.longitude]} icon={createBinIcon(bin.fillLevel, bin.status)}>
            <Popup>
              <div style={{ padding: '10px', minWidth: 210, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: fillColor, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid white', boxShadow: `0 0 4px ${fillColor}40` }}>
                      <Trash2 size={11} color="white" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--navy)' }}>{bin.binId}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: fillBg, color: fillColor, border: `1px solid ${fillBorder}` }}>{bin.status}</span>
                </div>
                {/* Location */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                  <MapPin size={13} color="#64748b" style={{ marginTop: '1px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--navy)', lineHeight: 1.3 }}>{bin.locationName}</span>
                </div>
                {/* Info rows */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', fontSize: '0.76rem', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Trash2 size={11} color="#64748b" />
                    <span>{bin.wasteType}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Gauge size={11} color="#64748b" />
                    <span>{bin.capacity} L</span>
                  </div>
                </div>
                {/* Fill bar */}
                <div style={{ background: '#f1f5f9', borderRadius: '6px', padding: '6px 8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.72rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Fill Level</span>
                    <span style={{ color: fillColor, fontWeight: 800 }}>{bin.fillLevel}%</span>
                  </div>
                  <div style={{ width: '100%', height: 5, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${bin.fillLevel}%`, height: '100%', background: fillColor, borderRadius: 3, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
                {/* Footer */}
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
                  <Clock size={10} color="#94a3b8" />
                  Last collected: {new Date(bin.lastCollectedAt).toLocaleString()}
                </div>
              </div>
            </Popup>
          </Marker>
          );
        })}

        {/* ── Vehicles ── */}
        {vehicles.map(v => {
          const isActive = v.status === 'Active';
          const statusColor = isActive ? '#0ea5e9' : v.status === 'Maintenance' ? '#ef4444' : '#6b7280';
          const statusBg = isActive ? '#f0f9ff' : v.status === 'Maintenance' ? '#fef2f2' : '#f8fafc';
          const statusBorder = isActive ? '#bae6fd' : v.status === 'Maintenance' ? '#fecaca' : '#e2e8f0';
          const fuelColor = v.fuelLevel < 30 ? '#ef4444' : v.fuelLevel < 60 ? '#f59e0b' : '#10b981';
          return (
          <Marker key={v._id} position={[v.latitude, v.longitude]} icon={createVehicleIcon(v.status)}>
            <Popup>
              <div style={{ padding: '10px', minWidth: 210, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: statusColor, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid white', boxShadow: `0 0 4px ${statusColor}40` }}>
                      <Truck size={11} color="white" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--navy)' }}>{v.vehicleNumber}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: statusBg, color: statusColor, border: `1px solid ${statusBorder}` }}>{v.status}</span>
                </div>
                {/* Driver */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}>
                  <User size={13} color="#64748b" />
                  <span style={{ color: '#64748b' }}>Driver:</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{v.driver?.name ?? 'Unassigned'}</span>
                </div>
                {/* Fuel bar */}
                <div style={{ background: '#f1f5f9', borderRadius: '6px', padding: '6px 8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.72rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Fuel size={10} color="#64748b" /> Fuel
                    </span>
                    <span style={{ color: fuelColor, fontWeight: 800 }}>{v.fuelLevel}%</span>
                  </div>
                  <div style={{ width: '100%', height: 5, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${v.fuelLevel}%`, height: '100%', background: fuelColor, borderRadius: 3, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
                {/* Load */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#475569', background: '#f8fafc', padding: '5px 8px', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Gauge size={11} color="#64748b" /> Payload
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--navy)' }}>{v.currentLoad}<span style={{ fontWeight: 500, color: '#94a3b8' }}>/{v.capacity} kg</span></span>
                </div>
              </div>
            </Popup>
          </Marker>
          );
        })}

        {/* ── Citizen reports ── */}
        {reports
          .filter(r => r.status === 'Pending' || r.status === 'Dispatched')
          .map(r => (
            <Marker key={r._id} position={[r.latitude, r.longitude]} icon={createReportIcon(r.description)}>
              <Popup>
                <div style={{ padding: '10px', minWidth: 210, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'white', border: '1.5px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 4px rgba(245,158,11,0.25)' }}>
                        <AlertTriangle size={11} color="#f59e0b" strokeWidth={2.5} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#d97706' }}>Citizen Report</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: r.status === 'Pending' ? '#fef3c7' : '#fee2e2', color: r.status === 'Pending' ? '#d97706' : '#ef4444', border: `1px solid ${r.status === 'Pending' ? '#fde68a' : '#fecaca'}` }}>{r.status}</span>
                  </div>
                  {/* Location */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                    <MapPin size={13} color="#64748b" style={{ marginTop: '1px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.3 }}>{r.locationName}</span>
                  </div>
                  {/* Description */}
                  {r.description && (
                    <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.4, background: '#fffbeb', padding: '7px 9px', borderRadius: '5px', border: '1px solid #fde68a', fontStyle: 'italic' }}>
                      {r.description}
                    </div>
                  )}
                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
                    <User size={10} color="#94a3b8" />
                    By <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{r.reportedBy || 'Anonymous'}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* ── Route visualization ── */}

        {/* Active pickup path — solid, bordered, premium route line (Google Maps style) */}
        {activeRoutePath.length > 1 && (
          <React.Fragment key={`active-pickup-path-${zoomKey}-${activeRoutePath.length}`}>
            {/* Outer drop shadow for map depth */}
            <Polyline
              positions={activeRoutePath}
              pathOptions={{ color: '#0f172a', weight: 9.5, opacity: 0.12, lineCap: 'round', lineJoin: 'round' }}
            />
            {/* Dark Blue Border/Casing */}
            <Polyline
              positions={activeRoutePath}
              pathOptions={{ color: '#1d4ed8', weight: 7.5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }}
            />
            {/* Core Royal Blue Line */}
            <Polyline
              positions={activeRoutePath}
              pathOptions={{ color: '#3b82f6', weight: 4.2, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
            />
          </React.Fragment>
        )}

        {/* Dump yard path — yellow road segment after pickups */}
        {activeDumpPath.length > 1 && (
          <React.Fragment key={`dump-yard-path-${zoomKey}-${activeDumpPath.length}`}>
            <Polyline
              positions={activeDumpPath}
              pathOptions={{ color: '#a16207', weight: 8.5, opacity: 0.12, lineCap: 'round', lineJoin: 'round' }}
            />
            <Polyline
              positions={activeDumpPath}
              pathOptions={{ color: '#f59e0b', weight: 6.5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
            />
            <Polyline
              positions={activeDumpPath}
              pathOptions={{ color: '#fde68a', weight: 3.5, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
            />
          </React.Fragment>
        )}

        {/* Dispatched Citizen Reports paths — green road segments */}
        {reports
          .filter(rep => rep.status === 'Dispatched' && rep.geometry && rep.geometry.length > 1)
          .map(rep => {
            const reportVehicle = vehicles.find(v => v._id === rep.dispatchedVehicle?._id || v._id === rep.dispatchedVehicle);
            const rVehiclePos = reportVehicle ? [reportVehicle.latitude, reportVehicle.longitude] : null;

            const remainingGeom = (() => {
              if (!rVehiclePos) return rep.geometry;
              
              let closestIdx = 0;
              let minGeomDist = Infinity;
              for (let i = 0; i < rep.geometry.length; i++) {
                const pt = rep.geometry[i];
                const distSq = (rVehiclePos[0] - pt[0]) ** 2 + (rVehiclePos[1] - pt[1]) ** 2;
                if (distSq < minGeomDist) {
                  minGeomDist = distSq;
                  closestIdx = i;
                }
              }
              return rep.geometry.slice(closestIdx);
            })();

            if (remainingGeom.length < 2) return null;

            return (
              <React.Fragment key={`dispatched-report-path-${rep._id}-${zoomKey}-${remainingGeom.length}`}>
                {/* Outer shadow */}
                <Polyline
                  positions={remainingGeom}
                  pathOptions={{ color: '#064e3b', weight: 8.5, opacity: 0.12, lineCap: 'round', lineJoin: 'round' }}
                />
                {/* Border casing */}
                <Polyline
                  positions={remainingGeom}
                  pathOptions={{ color: '#047857', weight: 6.5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
                />
                {/* Core Green Line */}
                <Polyline
                  positions={remainingGeom}
                  pathOptions={{ color: '#10b981', weight: 3.5, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
                />
              </React.Fragment>
            );
          })}



        {/* Dump yard marker */}
        {activeRoute?.dumpYard?.latitude && activeRoute?.dumpYard?.longitude && (
          <Marker position={[activeRoute.dumpYard.latitude, activeRoute.dumpYard.longitude]} icon={dumpYardIcon} zIndexOffset={900}>
            <Popup>
              <div style={{ padding: '10px', minWidth: 180, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <MapPin size={12} />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy)' }}>{activeRoute.dumpYard.name}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  Final dump yard after collection is completed.
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Coordinates: {activeRoute.dumpYard.latitude.toFixed(5)}, {activeRoute.dumpYard.longitude.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Numbered step markers for uncollected waypoints */}
        {uncollectedSteps.map((wp, idx) => (
          <Marker
            key={`step-${wp._id || idx}`}
            position={[wp.latitude, wp.longitude]}
            icon={createWaypointStepIcon(wp.stepNumber, idx === 0)}
            zIndexOffset={1000 + idx}
          >
            <Popup>
              <div style={{ padding: '8px', minWidth: 160 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: idx === 0 ? '#0ea5e9' : '#0f766e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>
                    {wp.stepNumber}
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--navy)' }}>Stop #{wp.stepNumber}</span>
                  {idx === 0 && <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', background: '#dbeafe', color: '#2563eb' }}>NEXT</span>}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={11} color="#64748b" /> {wp.locationName}
                </div>
                {wp.fillLevel !== undefined && (
                  <div style={{ fontSize: '0.72rem', color: wp.fillLevel >= 75 ? '#ef4444' : '#f59e0b', fontWeight: 700, marginTop: '3px' }}>
                    Fill: {wp.fillLevel}%
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Collected waypoint small circle indicators (faded, no route connection) */}
        {activeRoute && activeRoute.waypoints.filter(wp => wp.collected).map((wp, idx) => (
          <CircleMarker
            key={`done-${wp._id || idx}`}
            center={[wp.latitude, wp.longitude]}
            radius={5}
            pathOptions={{ fillColor: '#10b981', fillOpacity: 0.4, color: '#bbf7d0', weight: 1.5, opacity: 0.6 }}
          >
            <Popup>
              <div style={{ padding: '6px', minWidth: 120, textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981', marginBottom: '2px' }}>✓ Collected</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{wp.locationName}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* ── Selected location (citizen portal) ── */}
        {selectedLocation?.latitude && selectedLocation?.longitude && (
          <Marker position={[selectedLocation.latitude, selectedLocation.longitude]} icon={selectedLocationIcon}>
            <Popup>
              <div style={{ padding: '10px', minWidth: 180, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid white', boxShadow: '0 0 4px rgba(6,182,212,0.3)' }}>
                    <MapPin size={11} color="white" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0891b2' }}>Pinned Location</span>
                </div>
                {/* Coordinates */}
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--navy)', background: '#f0f9ff', padding: '5px 8px', borderRadius: '4px', border: '1px solid #bae6fd', fontWeight: 600 }}>
                  {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </div>
                {/* Hint */}
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0, lineHeight: 1.3 }}>
                  Fill in the form to submit your report.
                </p>
                {/* Clear button */}
                {onClearLocation && (
                  <button
                    type="button"
                    onClick={onClearLocation}
                    style={{
                      width: '100%', padding: '5px 8px', background: '#fef2f2', color: '#ef4444',
                      border: '1px solid #fecaca', borderRadius: '4px', fontSize: '0.72rem',
                      fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '4px', transition: 'all 0.15s ease'
                    }}
                  >
                    ✕ Clear Pin
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Legend overlay */}
      <MapLegend showReports={showReports} showRoutes={showRoutes} />
    </div>
  );
};

export default InteractiveMap;
