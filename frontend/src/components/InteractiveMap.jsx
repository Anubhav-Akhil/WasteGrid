import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { Trash2, Truck, AlertTriangle, MapPin, Circle, Wrench, Info, Droplet } from 'lucide-react';
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
const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
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
    const handleResize = () => {
      map.invalidateSize();
    };

    // Trigger immediately
    map.invalidateSize();

    // Trigger after layout shifts settle
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
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
  if (description.includes('[Slightly Full]')) {
    return { symbol: '🟡', color: '#eab308' };
  }
  if (description.includes('[Overflowing]')) {
    return { symbol: '🚨', color: '#ef4444' };
  }
  if (description.includes('[Damaged Bin]')) {
    return { symbol: '🔧', color: '#f97316' };
  }
  if (description.includes('[Foul Odor]')) {
    return { symbol: '🤢', color: '#22c55e' };
  }
  return { symbol: '⚠️', color: '#818cf8' }; // Fallback
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
  const trashIconSvg = <Trash2 size={12} strokeWidth={2.2} />;
  const truckIconSvg = <Truck size={12} strokeWidth={2.2} />;
  const alertIconSvg = <AlertTriangle size={10} strokeWidth={2.5} />;
  const infoIconSvg = <Info size={10} strokeWidth={2.5} />;
  const wrenchIconSvg = <Wrench size={10} strokeWidth={2.5} />;
  const odorIconSvg = <Droplet size={10} strokeWidth={2.5} />;

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
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {trashIconSvg}
        </div>
        <span>Bin — Low (&lt;50%)</span>
      </div>
      
      <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {trashIconSvg}
        </div>
        <span>Bin — Medium (50–74%)</span>
      </div>
      
      <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {trashIconSvg}
        </div>
        <span>Bin — Critical (≥75%)</span>
      </div>
      
      <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: 18, height: 18, borderRadius: '4px', background: '#06b6d4', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {truckIconSvg}
        </div>
        <span>Collection Truck</span>
      </div>
      
      {showReports && (
        <>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)', marginTop: '0.4rem', marginBottom: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Citizen Reports</div>
          
          <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 18, height: 18, borderRadius: '4px', background: '#eab308', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {infoIconSvg}
            </div>
            <span>Slightly Full</span>
          </div>
          
          <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 18, height: 18, borderRadius: '4px', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {alertIconSvg}
            </div>
            <span>Overflowing</span>
          </div>
          
          <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 18, height: 18, borderRadius: '4px', background: '#f97316', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {wrenchIconSvg}
            </div>
            <span>Damaged Bin</span>
          </div>
          
          <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 18, height: 18, borderRadius: '4px', background: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {odorIconSvg}
            </div>
            <span>Foul Odor</span>
          </div>
        </>
      )}
      
      {showRoutes && (
        <div className="map-legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.2rem' }}>
          <div style={{ width: 18, height: 4, background: '#06b6d4', borderRadius: 2 }} />
          <span>Active Route</span>
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const InteractiveMap = ({
  bins = [], vehicles = [], reports = [],
  activeRoute = null, onMapClick = null, selectedLocation = null
}) => {
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

  // Build polyline path
  const polylinePath = (() => {
    if (!activeRoute) return [];
    const path = [];
    const assignedVehicle = vehicles.find(v =>
      v._id === activeRoute.vehicle?._id || v._id === activeRoute.vehicle
    );
    if (assignedVehicle) path.push([assignedVehicle.latitude, assignedVehicle.longitude]);
    activeRoute.waypoints.forEach(wp => path.push([wp.latitude, wp.longitude]));
    if (assignedVehicle && activeRoute.waypoints.length > 0) {
      path.push([assignedVehicle.latitude, assignedVehicle.longitude]);
    }
    return path;
  })();

  const showReports = reports.some(r => r.status === 'Pending' || r.status === 'Dispatched');
  const showRoutes  = polylinePath.length > 0;

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
        <MapEvents onMapClick={onMapClick} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Bins */}
        {bins.map(bin => (
          <Marker key={bin._id} position={[bin.latitude, bin.longitude]} icon={createBinIcon(bin.fillLevel, bin.status)}>
            <Popup>
              <div style={{ fontSize: '0.82rem', minWidth: 180 }}>
                <h4 style={{ color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {bin.binId}
                  <span className={`badge ${bin.fillLevel >= 75 ? 'badge-danger' : bin.fillLevel >= 50 ? 'badge-warning' : 'badge-success'}`}>{bin.status}</span>
                </h4>
                <p><strong>📍</strong> {bin.locationName}</p>
                <p><strong>🗑️</strong> {bin.wasteType}</p>
                <p>
                  <strong>Fill:</strong>
                  <span style={{ color: bin.fillLevel >= 75 ? '#ef4444' : bin.fillLevel >= 50 ? '#f59e0b' : '#10b981', fontWeight: 700, marginLeft: 4 }}>
                    {bin.fillLevel}%
                  </span> / {bin.capacity} L
                </p>
                <p style={{ fontSize: '0.7rem', marginTop: '0.4rem', color: 'rgba(255,255,255,0.4)' }}>
                  Last collected: {new Date(bin.lastCollectedAt).toLocaleString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Vehicles */}
        {vehicles.map(v => (
          <Marker key={v._id} position={[v.latitude, v.longitude]} icon={createVehicleIcon(v.status)}>
            <Popup>
              <div style={{ fontSize: '0.82rem', minWidth: 170 }}>
                <h4 style={{ color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {v.vehicleNumber}
                  <span className={`badge ${v.status === 'Active' ? 'badge-info' : v.status === 'Maintenance' ? 'badge-danger' : 'badge-muted'}`}>{v.status}</span>
                </h4>
                <p><strong>👤 Driver:</strong> {v.driver?.name ?? 'Unassigned'}</p>
                <p><strong>⛽ Fuel:</strong> {v.fuelLevel}%</p>
                <p><strong>📦 Load:</strong> {v.currentLoad}/{v.capacity} kg</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Citizen reports */}
        {reports
          .filter(r => r.status === 'Pending' || r.status === 'Dispatched')
          .map(r => (
            <Marker key={r._id} position={[r.latitude, r.longitude]} icon={createReportIcon(r.description)}>
              <Popup>
                <div style={{ fontSize: '0.82rem', minWidth: 180 }}>
                  <h4 style={{ color: '#a5b4fc', marginBottom: '0.5rem' }}>
                    ⚠️ Overflow Report
                    <span className={`badge ${r.status === 'Pending' ? 'badge-danger' : 'badge-warning'}`} style={{ marginLeft: 6 }}>{r.status}</span>
                  </h4>
                  <p><strong>📍</strong> {r.locationName}</p>
                  {r.description && <p style={{ marginTop: '0.3rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>{r.description}</p>}
                  <p style={{ marginTop: '0.3rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>By {r.reportedBy}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Route polyline */}
        {showRoutes && (
          <>
            {/* Shadow polyline for depth */}
            <Polyline positions={polylinePath} color="rgba(0,0,0,0.4)" weight={8} opacity={0.5} />
            {/* Main route line */}
            <Polyline positions={polylinePath} color="#06b6d4" weight={4} opacity={0.9} dashArray="12, 8" />
          </>
        )}

        {/* Selected location (citizen portal) */}
        {selectedLocation?.latitude && selectedLocation?.longitude && (
          <Marker position={[selectedLocation.latitude, selectedLocation.longitude]} icon={selectedLocationIcon}>
            <Popup>
              <div style={{ fontSize: '0.82rem' }}>
                <h4 style={{ color: '#22d3ee', marginBottom: '0.4rem' }}>📍 Pinned Location</h4>
                <p style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                  {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.3rem' }}>
                  Fill in the form to submit your report.
                </p>
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
