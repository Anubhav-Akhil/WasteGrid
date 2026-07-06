import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getBackendUrl } from '../config';
import { useToast } from '../components/Toast';
import InteractiveMap from '../components/InteractiveMap';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Trash2, Truck, AlertTriangle, Route as RouteIcon,
  Plus, CheckCircle, RefreshCw, BarChart2, Search, Download,
  TrendingUp, X, ChevronRight, Zap, Clock, Copy,
} from 'lucide-react';

// ── Helper: download CSV ──────────────────────────────────────────────────────
function exportCSV(bins) {
  const headers = ['Bin ID', 'Location', 'Waste Type', 'Fill Level (%)', 'Status', 'Capacity (L)', 'Last Collected'];
  const rows = bins.map(b => [
    b.binId, b.locationName, b.wasteType, b.fillLevel, b.status, b.capacity,
    new Date(b.lastCollectedAt).toLocaleString(),
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `bins_report_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ w = '100%', h = 20, style = {} }) => (
  <div className="skeleton" style={{ width: w, height: h, borderRadius: 'var(--radius-sm)', ...style }} />
);

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, accentColor = 'var(--primary)', loading }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
        {loading ? (
          <Skeleton h={32} w="80px" style={{ marginTop: '0.5rem' }} />
        ) : (
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', marginTop: '0.25rem', lineHeight: 1 }}>{value}</div>
        )}
      </div>
      <div className="stat-icon" style={{ background: `${accentColor}12` }}>
        {React.cloneElement(icon, { size: 20, color: accentColor })}
      </div>
    </div>
    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'auto' }}>{sub}</div>}
  </div>
);

// ── Fill-level bar ───────────────────────────────────────────────────────────
const FillBar = ({ value }) => {
  const color = value >= 75 ? 'var(--danger)' : value >= 50 ? 'var(--warning)' : 'var(--primary)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div className="progress-bar-wrap" style={{ width: 60 }}>
        <div className="progress-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span style={{ fontSize: '0.78rem', fontWeight: 700, color }}>{value}%</span>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const {
    bins, vehicles, routes, reports, analytics, loading,
    fetchBins, fetchVehicles, fetchRoutes, fetchReports, fetchAnalytics,
    createBin, deleteBin, updateBin, createVehicle, deleteVehicle,
    optimizeRoute, resolveReport, notifications, clearNotification,
  } = useApp();

  // Listen for admin notifications
  useEffect(() => {
    const adminNotes = notifications.filter(n => n.target === 'admin');
    if (adminNotes.length > 0) {
      adminNotes.forEach(n => {
        toast.success(n.message, n.title || 'Notification');
        clearNotification(n.id);
      });
    }
  }, [notifications, clearNotification, toast]);

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [binSearch, setBinSearch] = useState('');
  const [showBinForm, setShowBinForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [unassignedDrivers, setUnassignedDrivers] = useState([]);
  const [activeRouteView, setActiveRouteView] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date());

  const [binForm, setBinForm] = useState({ binId: '', locationName: '', latitude: 30.7333, longitude: 76.7794, capacity: 120, wasteType: 'Organic' });
  const [vehicleForm, setVehicleForm] = useState({ vehicleNumber: '', driverId: '', capacity: 1000 });

  // Fetch drivers list for fleet tab
  useEffect(() => {
    if (!user || activeTab !== 'fleet') return;
    const API_URL = getBackendUrl();
    fetch(`${API_URL}/api/auth/drivers`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(setUnassignedDrivers)
      .catch(() => {});
  }, [user, activeTab, vehicles]);

  // Active route for map display
  const activeRoute = useMemo(() => {
    if (activeRouteView) {
      const updated = routes.find(r => r._id === activeRouteView._id);
      return updated || activeRouteView;
    }
    return routes.find(r => r.status === 'In Progress') || null;
  }, [routes, activeRouteView]);

  const fullBins = useMemo(
    () => bins.filter(b => b.fillLevel >= 75 || b.status === 'Overflowing'),
    [bins]
  );

  const computeDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const estimateRouteDistance = (vehicle, binsToVisit) => {
    const unvisited = [...binsToVisit];
    let currentLat = vehicle.latitude;
    let currentLng = vehicle.longitude;
    let totalDistance = 0;

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;
      for (let i = 0; i < unvisited.length; i++) {
        const bin = unvisited[i];
        const distance = computeDistance(currentLat, currentLng, bin.latitude, bin.longitude);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }
      totalDistance += minDistance;
      currentLat = unvisited[nearestIndex].latitude;
      currentLng = unvisited[nearestIndex].longitude;
      unvisited.splice(nearestIndex, 1);
    }

    return Math.round(totalDistance * 10) / 10;
  };

  const recommendedVehicle = useMemo(() => {
    const idleVehicles = vehicles.filter(v => v.status === 'Idle' && v.driver && v.latitude && v.longitude);
    if (idleVehicles.length === 0 || fullBins.length === 0) return null;

    let bestVehicle = null;
    let bestDistance = Infinity;

    for (const vehicle of idleVehicles) {
      const distance = estimateRouteDistance(vehicle, fullBins);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestVehicle = { ...vehicle, estimatedRouteDistance: distance };
      }
    }

    return bestVehicle;
  }, [vehicles, fullBins]);

  useEffect(() => {
    if (recommendedVehicle && !selectedVehicle) {
      setSelectedVehicle(recommendedVehicle._id);
    }
  }, [recommendedVehicle, selectedVehicle]);

  const criticalBins = useMemo(() => bins.filter(b => b.fillLevel >= 75).slice(0, 4), [bins]);
  const pendingReports = useMemo(() => reports.filter(r => r.status === 'Pending').slice(0, 4), [reports]);
  const activeVehicles = useMemo(() => vehicles.filter(v => v.status === 'Active'), [vehicles]);
  const systemHealthScore = useMemo(() => {
    const criticalCount = criticalBins.length;
    const pendingCount = pendingReports.length;
    const activeCount = activeVehicles.length;
    return Math.max(0, Math.min(100, 100 - criticalCount * 8 - pendingCount * 4 + activeCount * 2));
  }, [criticalBins, pendingReports, activeVehicles]);

  const activityFeed = useMemo(() => {
    const feed = [];
    criticalBins.forEach(bin => feed.push({ type: 'bin', title: `${bin.binId} needs attention`, detail: `${bin.fillLevel}% full at ${bin.locationName}` }));
    pendingReports.forEach(report => feed.push({ type: 'report', title: report.locationName, detail: report.description || 'New citizen report received' }));
    return feed.slice(0, 6);
  }, [criticalBins, pendingReports]);

  // Filtered bins
  const filteredBins = useMemo(() => {
    const q = binSearch.toLowerCase();
    if (!q) return bins;
    return bins.filter(b =>
      b.binId.toLowerCase().includes(q) ||
      b.locationName.toLowerCase().includes(q) ||
      b.wasteType.toLowerCase().includes(q)
    );
  }, [bins, binSearch]);

  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const timer = setInterval(() => {
      fetchBins(); fetchVehicles(); fetchRoutes(); fetchReports(); fetchAnalytics();
      setLastUpdatedAt(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, [autoRefreshEnabled, fetchBins, fetchVehicles, fetchRoutes, fetchReports, fetchAnalytics]);

  const refreshData = (showToast = true) => {
    fetchBins(); fetchVehicles(); fetchRoutes(); fetchReports(); fetchAnalytics();
    setLastUpdatedAt(new Date());
    if (showToast) toast.info('Data refreshed successfully.', 'Refreshed');
  };

  const copyInsights = async () => {
    const summary = [
      `WasteGrid health: ${systemHealthScore}%`,
      `Critical bins: ${criticalBins.length}`,
      `Pending reports: ${pendingReports.length}`,
      `Active vehicles: ${activeVehicles.length}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      toast.success('Insights copied to clipboard.', 'Copied');
    } catch {
      toast.error('Clipboard access is unavailable.', 'Copy Failed');
    }
  };

  const handleOptimize = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    setOptimizing(true);
    try {
      const r = await optimizeRoute(selectedVehicle);
      toast.success(`Route dispatched — ${r.waypoints.length} bins, ${r.distance} km.`, 'Route Dispatched!');
      setSelectedVehicle('');
      setActiveRouteView(r);
    } catch (err) {
      toast.error(err.message || 'No bins ≥ 75% found. Increase fill levels first.', 'Dispatch Failed');
    } finally {
      setOptimizing(false);
    }
  };

  const handleBinSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBin(binForm);
      toast.success(`Bin ${binForm.binId} registered.`, 'Bin Added');
      setShowBinForm(false);
      setBinForm({ binId: '', locationName: '', latitude: 30.7333, longitude: 76.7794, capacity: 120, wasteType: 'Organic' });
    } catch (err) {
      toast.error(err.message || 'Failed to create bin.');
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVehicle(vehicleForm);
      toast.success(`Vehicle ${vehicleForm.vehicleNumber} registered.`, 'Vehicle Added');
      setShowVehicleForm(false);
      setVehicleForm({ vehicleNumber: '', driverId: '', capacity: 1000 });
    } catch (err) {
      toast.error(err.message || 'Failed to create vehicle.');
    }
  };

  const handleDeleteBin = async (id, binId) => {
    await deleteBin(id);
    toast.warning(`Bin ${binId} removed.`, 'Bin Deleted');
  };

  const handleDeleteVehicle = async (id, num) => {
    await deleteVehicle(id);
    toast.warning(`Vehicle ${num} removed.`, 'Vehicle Removed');
  };

  const handleResolve = async (id) => {
    await resolveReport(id);
    toast.success('Report marked as resolved.', 'Resolved');
  };

  const simulateFill = async (bin) => {
    const newVal = bin.fillLevel >= 100 ? 0 : Math.min(100, bin.fillLevel + 25);
    await updateBin(bin._id, { fillLevel: newVal });
    toast.info(`${bin.binId}: fill level → ${newVal}%`);
  };

  const tabs = [
    { id: 'overview', icon: <BarChart2 size={15} />, label: 'Overview' },
    { id: 'bins',     icon: <Trash2  size={15} />,  label: `Bins (${bins.length})` },
    { id: 'fleet',    icon: <Truck   size={15} />,  label: 'Fleet' },
    { id: 'routes',   icon: <RouteIcon size={15} />, label: `Routes (${routes.length})` },
    {
      id: 'reports',
      icon: <AlertTriangle size={15} />,
      label: 'Reports',
      badge: reports.filter(r => r.status === 'Pending').length,
    },
  ];

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper animate-pageIn" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Sub-header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'white' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--navy)', fontWeight: 800 }}>Operations Dashboard</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>Manage public bins, routes, collection vehicle dispatch, and citizen alerts</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {activeTab === 'bins' && (
            <button onClick={() => exportCSV(bins)} className="btn btn-secondary btn-sm" title="Export CSV">
              <Download size={14} /> Export CSV
            </button>
          )}
          <button onClick={refreshData} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
            {t.badge > 0 && (
              <span style={{ marginLeft: 4, background: 'var(--danger)', color: 'white', fontSize: '9px', padding: '1px 5px', borderRadius: '99px', fontWeight: 800 }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main content grid */}
      <div className="dashboard-grid" style={{ flex: 1 }}>

        {/* LEFT PANEL */}
        <div className="card" style={{ gridColumn: 'span 7', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>

          {/* ── TAB: OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="animate-tabSwitch" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
                <StatCard icon={<Trash2 />}        label="Total Bins"      value={analytics?.summary.totalBins ?? '—'}  accentColor="var(--primary)"   loading={!analytics} />
                <StatCard icon={<AlertTriangle />}  label="Critical Bins"  value={analytics?.summary.fullBins ?? '—'}   accentColor="var(--danger)"    loading={!analytics} sub="≥ 75% full" />
                <StatCard icon={<Truck />}          label="Active Trucks"  value={analytics ? `${analytics.summary.activeVehicles}/${analytics.summary.totalVehicles}` : '—'} accentColor="var(--secondary)" loading={!analytics} />
                <StatCard icon={<TrendingUp />}     label="Efficiency"     value={analytics ? `${analytics.summary.collectionEfficiency}%` : '—'} accentColor="var(--accent)" loading={!analytics} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 800 }}>Operations Pulse</h4>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, background: systemHealthScore >= 75 ? 'var(--primary-light)' : 'var(--warning-light)', color: systemHealthScore >= 75 ? 'var(--primary-hover)' : 'var(--warning)', padding: '0.2rem 0.5rem', borderRadius: '99px' }}>
                      {systemHealthScore >= 75 ? 'Healthy' : systemHealthScore >= 50 ? 'Stable' : 'Watch'}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy)' }}>{systemHealthScore}%</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Live health score from critical bins, active routes, and unresolved reports.</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Auto-refresh {autoRefreshEnabled ? 'on' : 'off'}</span>
                    <span>{lastUpdatedAt.toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 800 }}>Smart Dispatch Assistant</h4>
                    <Zap size={16} color="var(--accent)" />
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {recommendedVehicle ? (
                      <>Best-fit truck: <strong>{recommendedVehicle.vehicleNumber}</strong> ({recommendedVehicle.driver?.name}) — estimated cleanup route <strong>{recommendedVehicle.estimatedRouteDistance.toFixed(1)} km</strong>.</>
                    ) : (
                      'No idle truck with an assigned driver is currently available.'
                    )}
                  </div>
                  <div style={{ marginTop: '0.7rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('routes')}>Open Routes</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('reports')}>Review Alerts</button>
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 800 }}>Priority Bin Queue</h4>
                    <AlertTriangle size={16} color="var(--danger)" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {criticalBins.length > 0 ? criticalBins.map(bin => (
                      <div key={bin._id} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{bin.binId}</span>
                        <strong style={{ color: 'var(--danger)' }}>{bin.fillLevel}%</strong>
                      </div>
                    )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>No critical bins right now.</span>}
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 800 }}>Smart Insights</h4>
                    <button onClick={copyInsights} className="btn btn-ghost btn-xs" title="Copy summary">
                      <Copy size={13} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <div>• {criticalBins.length} critical bins need immediate attention.</div>
                    <div>• {pendingReports.length} unresolved reports are active.</div>
                    <div>• {activeVehicles.length} vehicles are currently online.</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 800 }}>Route Efficiency</h4>
                    <RouteIcon size={16} color="var(--secondary)" />
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>{analytics?.summary.collectionEfficiency ?? 0}%</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Optimized route performance based on active dispatch data.</div>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 800 }}>Fleet Health</h4>
                    <Truck size={16} color="var(--primary)" />
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>{activeVehicles.length}/{vehicles.length}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Active vehicles ready for dispatch and live monitoring.</div>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 800 }}>Hotspot Alerts</h4>
                    <AlertTriangle size={16} color="var(--warning)" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {pendingReports.length > 0 ? pendingReports.map(report => (
                      <div key={report._id} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{report.locationName}</div>
                    )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>No hotspot alerts.</span>}
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 800 }}>Live Activity Feed</h4>
                    <Clock size={16} color="var(--text-muted)" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {activityFeed.length > 0 ? activityFeed.map((item, index) => (
                      <div key={`${item.title}-${index}`} style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.45rem' }}>
                        <strong>{item.title}</strong><div>{item.detail}</div>
                      </div>
                    )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Your feed is clear.</span>}
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', flex: 1, minHeight: '300px' }}>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', background: 'white' }}>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', paddingLeft: '0.25rem', fontWeight: 700 }}>
                    Weekly Waste Collection (kg)
                  </h4>
                  {analytics ? (
                    <div style={{ flex: 1, minHeight: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.weeklyTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gOrganic" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gRecycle" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="var(--secondary)" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                          <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <Tooltip
                            contentStyle={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }}
                            labelStyle={{ color: 'var(--text-primary)', fontWeight: 700 }}
                          />
                          <Area type="monotone" dataKey="organic"    stroke="var(--primary)" fillOpacity={1} fill="url(#gOrganic)" name="Organic" strokeWidth={2} />
                          <Area type="monotone" dataKey="recyclable" stroke="var(--secondary)" fillOpacity={1} fill="url(#gRecycle)" name="Recyclable" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                      {[80, 60, 90, 50, 70].map((w, i) => <Skeleton key={i} h={6} w={`${w}%`} />)}
                    </div>
                  )}
                </div>

                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white' }}>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', alignSelf: 'flex-start', fontWeight: 700 }}>
                    Bin Status Split
                  </h4>
                  {analytics ? (
                    <>
                      <div style={{ flex: 1, width: '100%', minHeight: 160 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={analytics.binBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={68} paddingAngle={4} dataKey="value" strokeWidth={0}>
                              {analytics.binBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', marginTop: '0.5rem' }}>
                        {analytics.binBreakdown.map((b, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color }} />
                              <span style={{ color: 'var(--text-secondary)' }}>{b.name}</span>
                            </span>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{b.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>{[1,2,3].map(i=><Skeleton key={i} h={8} />)}</div>}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: BINS ── */}
          {activeTab === 'bins' && (
            <div className="animate-tabSwitch" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              {/* Controls row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div className="search-input-wrap">
                  <Search size={15} className="search-icon" />
                  <input className="search-input" placeholder="Search bins..." value={binSearch} onChange={e => setBinSearch(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => exportCSV(bins)} className="btn btn-secondary btn-sm"><Download size={13} /> CSV</button>
                  <button onClick={() => setShowBinForm(v => !v)} className="btn btn-primary btn-sm">
                    {showBinForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add Bin</>}
                  </button>
                </div>
              </div>

              {showBinForm && (
                <form onSubmit={handleBinSubmit} className="card-flat animate-slideUp" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', background: 'var(--bg-secondary)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Bin ID</label>
                    <input type="text" required placeholder="BIN-201" className="form-input" value={binForm.binId} onChange={e => setBinForm({ ...binForm, binId: e.target.value.toUpperCase() })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Location Name</label>
                    <input type="text" required placeholder="Sector 22 Market" className="form-input" value={binForm.locationName} onChange={e => setBinForm({ ...binForm, locationName: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Latitude</label>
                    <input type="number" step="0.0001" className="form-input" value={binForm.latitude} onChange={e => setBinForm({ ...binForm, latitude: parseFloat(e.target.value) })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Longitude</label>
                    <input type="number" step="0.0001" className="form-input" value={binForm.longitude} onChange={e => setBinForm({ ...binForm, longitude: parseFloat(e.target.value) })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Waste Type</label>
                    <select className="form-select" value={binForm.wasteType} onChange={e => setBinForm({ ...binForm, wasteType: e.target.value })}>
                      {['Organic','Recyclable','Hazardous','E-waste'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Bin</button>
                  </div>
                </form>
              )}

              {/* Bins table */}
              <div style={{ overflowX: 'auto', flex: 1 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Location</th><th>Type</th><th>Fill</th><th>Status</th><th style={{ textAlign: 'center' }}>Simulate</th><th style={{ textAlign: 'right' }}>Del</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBins.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No bins match your search.</td></tr>
                    ) : filteredBins.map(bin => (
                      <tr key={bin._id}>
                        <td style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--primary)' }}>{bin.binId}</td>
                        <td className="truncate" style={{ maxWidth: 150 }}>{bin.locationName}</td>
                        <td><span className="badge badge-muted">{bin.wasteType}</span></td>
                        <td><FillBar value={bin.fillLevel} /></td>
                        <td>
                          <span className={`badge ${bin.fillLevel >= 75 ? 'badge-danger' : bin.fillLevel >= 50 ? 'badge-warning' : 'badge-success'}`}>
                            {bin.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => simulateFill(bin)} className="btn btn-ghost btn-xs" style={{ color: 'var(--primary)', fontWeight: 700 }}>+25%</button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => handleDeleteBin(bin._id, bin.binId)} className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }}>
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB: FLEET ── */}
          {activeTab === 'fleet' && (
            <div className="animate-tabSwitch" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy)' }}>Fleet — {vehicles.length} vehicles</h3>
                <button onClick={() => setShowVehicleForm(v => !v)} className="btn btn-primary btn-sm">
                  {showVehicleForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add Truck</>}
                </button>
              </div>

              {showVehicleForm && (
                <form onSubmit={handleVehicleSubmit} className="card-flat animate-slideUp" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', background: 'var(--bg-secondary)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Plate Number</label>
                    <input type="text" required placeholder="CH-01-G-1234" className="form-input" value={vehicleForm.vehicleNumber} onChange={e => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value.toUpperCase() })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Assign Driver</label>
                    <select className="form-select" value={vehicleForm.driverId} onChange={e => setVehicleForm({ ...vehicleForm, driverId: e.target.value })}>
                      <option value="">Unassigned</option>
                      {unassignedDrivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Capacity (kg)</label>
                    <input type="number" className="form-input" value={vehicleForm.capacity} onChange={e => setVehicleForm({ ...vehicleForm, capacity: parseInt(e.target.value) })} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register Truck</button>
                  </div>
                </form>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {vehicles.map(v => {
                  const loadPct = Math.round((v.currentLoad / v.capacity) * 100);
                  return (
                    <div key={v._id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h4 style={{ fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 700 }}>🚚 {v.vehicleNumber}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>Driver: <strong>{v.driver?.name || 'Unassigned'}</strong></p>
                        </div>
                        <span className={`badge ${v.status === 'Active' ? 'badge-info' : v.status === 'Maintenance' ? 'badge-danger' : 'badge-muted'}`}>{v.status}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            <span>Fuel Level</span><span style={{ fontWeight: 700, color: v.fuelLevel < 30 ? 'var(--danger)' : 'var(--text-primary)' }}>{v.fuelLevel}%</span>
                          </div>
                          <div className="progress-bar-wrap">
                            <div className="progress-bar-fill" style={{ width: `${v.fuelLevel}%`, background: v.fuelLevel < 30 ? 'var(--danger)' : 'var(--primary)' }} />
                          </div>
                        </div>

                        <div style={{ marginTop: '0.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            <span>Payload Load</span><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{v.currentLoad}/{v.capacity} kg</span>
                          </div>
                          <div className="progress-bar-wrap">
                            <div className="progress-bar-fill" style={{ width: `${loadPct}%`, background: 'var(--secondary)' }} />
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.85rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
                        <button onClick={() => handleDeleteVehicle(v._id, v.vehicleNumber)} className="btn btn-ghost btn-xs" style={{ color: 'var(--danger)' }}>Remove Truck</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB: ROUTES ── */}
          {activeTab === 'routes' && (
            <div className="animate-tabSwitch" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy)' }}>Active Route Dispatches</h3>
              {routes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🗺️</div>
                  <div className="empty-state-title">No routes generated yet</div>
                  <div className="empty-state-desc">Use the Smart Route Dispatcher on the right to optimize collection schedules.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto' }}>
                  {routes.map(r => {
                    const collected = r.waypoints.filter(w => w.collected).length;
                    const total = r.waypoints.length;
                    const pct = total > 0 ? Math.round((collected / total) * 100) : 0;
                    return (
                      <div
                        key={r._id}
                        style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', cursor: 'pointer', background: 'white', borderColor: activeRouteView?._id === r._id ? 'var(--primary)' : 'var(--border-color)', boxShadow: activeRouteView?._id === r._id ? '0 0 0 2px var(--primary-light)' : 'none' }}
                        onClick={() => setActiveRouteView(activeRouteView?._id === r._id ? null : r)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--navy)' }}>{r.routeName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                              Truck: <strong>{r.vehicle?.vehicleNumber}</strong> • Driver: <strong>{r.driver?.name}</strong> • {r.distance} km • ~{r.duration} mins
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={`badge ${r.status === 'Completed' ? 'badge-success' : r.status === 'In Progress' ? 'badge-info' : 'badge-muted'}`}>{r.status}</span>
                            <ChevronRight size={14} color="var(--text-muted)" />
                          </div>
                        </div>
                        <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            <span>Collected {collected}/{total} waypoints</span>
                            <span style={{ fontWeight: 700 }}>{pct}%</span>
                          </div>
                          <div className="progress-bar-wrap">
                            <div className="progress-bar-fill" style={{ width: `${pct}%`, background: r.status === 'Completed' ? 'var(--primary)' : 'var(--secondary)' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: REPORTS ── */}
          {activeTab === 'reports' && (
            <div className="animate-tabSwitch" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Citizen Overflow Reports</h3>
                <span className="badge badge-danger">{reports.filter(r => r.status === 'Pending').length} Action Required</span>
              </div>
              {reports.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">✅</div>
                  <div className="empty-state-title">No pending public complaints</div>
                  <div className="empty-state-desc">Overflow reports submitted by citizens will show up here.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto' }}>
                  {reports.map(rep => (
                    <div key={rep._id} style={{ border: '1px solid var(--border-color)', borderLeft: `4px solid ${rep.status === 'Pending' ? 'var(--danger)' : rep.status === 'Dispatched' ? 'var(--warning)' : 'var(--primary)'}`, borderRadius: 'var(--radius-md)', padding: '1rem', background: 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--navy)' }}>{rep.locationName}</span>
                            <span className={`badge ${rep.status === 'Pending' ? 'badge-danger' : rep.status === 'Dispatched' ? 'badge-warning' : 'badge-success'}`}>{rep.status}</span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rep.description}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                            Reported by <strong>{rep.reportedBy}</strong> • {new Date(rep.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {rep.status === 'Pending' && (
                          <button onClick={() => handleResolve(rep._id)} className="btn btn-primary btn-xs" style={{ marginLeft: '0.75rem', flexShrink: 0 }}>
                            <CheckCircle size={12} /> Resolve Alert
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Interactive Map card */}
          <div className="card" style={{ flex: 1, minHeight: 340, padding: '0.5rem', overflow: 'hidden', position: 'relative' }}>
            <InteractiveMap bins={bins} vehicles={vehicles} reports={reports} activeRoute={activeRoute} />
          </div>

          {/* Route Dispatcher card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--navy)' }}>
              <Zap size={16} color="var(--primary)" /> Smart Route Dispatcher
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.5 }}>
              Dispatch an idle collector vehicle to calculate and trigger the optimized path covering all currently full bins.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={12} color="var(--text-muted)" />
                {vehicles.filter(v => v.status === 'Idle' && v.driver).length} active drivers online and idle
              </div>
              {recommendedVehicle && (
                <button
                  type="button"
                  onClick={() => setSelectedVehicle(recommendedVehicle._id)}
                  className="btn btn-outline-secondary btn-xs"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                >
                  Use best truck
                </button>
              )}
            </div>

            {recommendedVehicle ? (
              <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: '#334155', lineHeight: 1.4, padding: '0.75rem 0.9rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem', background: '#f8fafc' }}>
                Recommended: <strong>{recommendedVehicle.vehicleNumber}</strong> ({recommendedVehicle.driver?.name}) — estimated cleanup route <strong>{recommendedVehicle.estimatedRouteDistance.toFixed(1)} km</strong>.
              </div>
            ) : (
              <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                No idle truck with an assigned driver is currently available or there are no bins requiring collection.
              </div>
            )}

            <form onSubmit={handleOptimize} style={{ display: 'flex', gap: '0.5rem' }}>
              <select required className="form-select" style={{ flex: 1, fontSize: '0.8rem' }} value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
                <option value="">Select available truck…</option>
                {vehicles.filter(v => v.status === 'Idle' && v.driver).map(v => (
                  <option key={v._id} value={v._id}>
                    {v.vehicleNumber} ({v.driver?.name}){recommendedVehicle?._id === v._id ? ' — recommended' : ''}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={optimizing || !selectedVehicle} className="btn btn-primary btn-sm">
                {optimizing ? <><span style={{ width:13,height:13,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:'50%',display:'inline-block'}} className="animate-spin" /> Calculating…</> : <><Zap size={13} /> Dispatch</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
