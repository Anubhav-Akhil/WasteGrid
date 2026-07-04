import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import InteractiveMap from '../components/InteractiveMap';
import { CheckCircle2, Navigation, Fuel, Gauge, Clock, MapPin, Truck, ChevronRight, RefreshCw, Zap, AlertTriangle } from 'lucide-react';

// ── Helper: estimated remaining time ─────────────────────────────────────────
const calcETA = (route) => {
  if (!route) return null;
  const remaining = route.waypoints.filter(w => !w.collected).length;
  const totalWaypoints = route.waypoints.length;
  if (totalWaypoints === 0) return 0;
  const progressRatio = (totalWaypoints - remaining) / totalWaypoints;
  const remainingDuration = Math.round(route.duration * (1 - progressRatio));
  return remainingDuration;
};

// ── Stat mini card ────────────────────────────────────────────────────────────
const MiniStat = ({ icon, label, value, color = 'var(--primary)' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flex: 1 }}>
    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {React.cloneElement(icon, { size: 17, color })}
    </div>
    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1 }}>{value}</span>
    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', fontWeight: 600 }}>{label}</span>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
const DriverDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { bins, vehicles, routes, fetchRoutes, fetchVehicles, fetchBins, collectWaypoint, completeRoute } = useApp();

  const [updating, setUpdating] = useState(null); // binId being updated
  const [lastSynced, setLastSynced] = useState(new Date());

  // ── Fix: use toString() to avoid MongoDB ObjectId reference comparison bug ──
  const driverVehicle = useMemo(() => {
    if (!user) return null;
    return vehicles.find(v =>
      v.driver && v.driver._id && v.driver._id.toString() === user._id.toString()
    ) || null;
  }, [vehicles, user]);

  // ── Active route for this driver ──────────────────────────────────────────
  const activeRoute = useMemo(() => {
    if (!user) return null;
    return routes.find(r =>
      r.driver &&
      (r.driver._id?.toString() === user._id?.toString() || r.driver?.toString() === user._id?.toString()) &&
      r.status !== 'Completed'
    ) || null;
  }, [routes, user]);

  const collectedCount = activeRoute?.waypoints.filter(w => w.collected).length ?? 0;
  const totalCount     = activeRoute?.waypoints.length ?? 0;
  const progressPct    = totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0;
  const etaMin         = calcETA(activeRoute);
  const allDone        = totalCount > 0 && collectedCount === totalCount;
  const urgentStops = useMemo(() => (activeRoute?.waypoints || []).filter(wp => !wp.collected && wp.fillLevel >= 75).slice(0, 3), [activeRoute]);

  const handleCollect = async (binId, locationName) => {
    if (!activeRoute) return;
    setUpdating(binId);
    try {
      await collectWaypoint(activeRoute._id, binId);
      fetchRoutes(); fetchVehicles(); fetchBins();
      setLastSynced(new Date());
      toast.success(`${locationName} — waste collected!`, 'Waypoint Done');
    } catch (err) {
      toast.error(err.message || 'Collection failed.', 'Error');
    } finally {
      setUpdating(null);
    }
  };

  const handleComplete = async () => {
    if (!activeRoute) return;
    setUpdating('complete');
    try {
      await completeRoute(activeRoute._id);
      fetchRoutes(); fetchVehicles();
      setLastSynced(new Date());
      toast.success('Route completed! Payload dumped at depot.', 'Mission Complete 🎉');
    } catch (err) {
      toast.error(err.message || 'Could not complete route.', 'Error');
    } finally {
      setUpdating(null);
    }
  };

  const handleRefresh = () => {
    fetchRoutes(); fetchVehicles(); fetchBins();
    setLastSynced(new Date());
    toast.info('Route data synced.', 'Synced');
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Sub-header */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--navy)', fontWeight: 800 }}>Driver Console</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>Real-time waypoint instructions & navigation tools</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button onClick={handleRefresh} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Sync
          </button>
          {driverVehicle && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: 'var(--primary-light)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '99px' }}>
              <Truck size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-hover)' }}>{driverVehicle.vehicleNumber}</span>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid" style={{ flex: 1 }}>

        {/* LEFT: Waypoint Console */}
        <div className="card" style={{ gridColumn: 'span 5', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflow: 'hidden' }}>

          {/* Vehicle Stats */}
          {driverVehicle && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <MiniStat icon={<Fuel />}   label="Fuel"    value={`${driverVehicle.fuelLevel}%`}  color={driverVehicle.fuelLevel < 30 ? 'var(--danger)' : 'var(--warning)'} />
              <div style={{ width: 1, height: 36, background: 'var(--border-color)' }} />
              <MiniStat icon={<Gauge />}  label="Payload" value={`${driverVehicle.currentLoad}kg`} color="var(--secondary)" />
              <div style={{ width: 1, height: 36, background: 'var(--border-color)' }} />
              <MiniStat icon={<Truck />}  label="Status"  value={driverVehicle.status} color={driverVehicle.status === 'Active' ? 'var(--primary)' : 'var(--text-muted)'} />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div className="card" style={{ padding: '0.8rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Route Progress</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', marginTop: '0.3rem' }}>{progressPct}%</div>
            </div>
            <div className="card" style={{ padding: '0.8rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>ETA</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', marginTop: '0.3rem' }}>{etaMin ?? 0} min</div>
            </div>
            <div className="card" style={{ padding: '0.8rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Priority Stops</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.3rem' }}>{urgentStops.length}</div>
            </div>
          </div>

          {!activeRoute ? (
            <div className="empty-state" style={{ flex: 1 }}>
              <div className="empty-state-icon">💤</div>
              <div className="empty-state-title">No Active Dispatch</div>
              <div className="empty-state-desc">Waiting for dispatch optimizer to assign a collection path to your vehicle.</div>
            </div>
          ) : (
            <>
              {/* Route header & progress */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}>
                      <Navigation size={16} color="var(--primary)" /> {activeRoute.routeName}
                    </h3>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {activeRoute.distance} km · {totalCount} stops · ~{activeRoute.duration} mins
                    </p>
                  </div>
                  <span className={`badge ${activeRoute.status === 'In Progress' ? 'badge-info' : 'badge-muted'}`}>
                    {activeRoute.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    <span>{collectedCount} of {totalCount} bins collected</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{progressPct}%</span>
                  </div>
                  <div className="progress-bar-wrap" style={{ height: 8 }}>
                    <div className="progress-bar-fill" style={{ width: `${progressPct}%`, background: 'var(--primary)' }} />
                  </div>
                </div>

                {/* ETA */}
                {etaMin !== null && etaMin > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    <Clock size={12} color="var(--text-muted)" />
                    Estimated remaining: <strong style={{ color: 'var(--primary-hover)' }}>~{etaMin} mins</strong>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  <Zap size={12} color="var(--accent)" />
                  Last synced {lastSynced.toLocaleTimeString()}
                </div>
              </div>

              {/* Waypoints */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', flex: 1 }}>
                {activeRoute.waypoints.map((wp, idx) => {
                  const isUpdating = updating === wp.binId?.toString();
                  const liveBin = bins.find(b => b._id.toString() === wp.binId?.toString());
                  return (
                    <div
                      key={wp._id || idx}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        borderLeft: `4px solid ${wp.collected ? 'var(--primary)' : 'var(--warning)'}`,
                        background: wp.collected ? 'var(--primary-50)' : 'white',
                        opacity: wp.collected ? 0.75 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Step number */}
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: wp.collected ? 'var(--primary-light)' : 'var(--bg-secondary)', border: `1px solid ${wp.collected ? 'var(--primary)' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: wp.collected ? 'var(--primary)' : 'var(--text-secondary)', flexShrink: 0 }}>
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--navy)' }}>{wp.locationName}</div>
                          {liveBin && !wp.collected && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                              <MapPin size={11} color="var(--text-muted)" />
                              <span style={{ fontSize: '0.72rem', color: liveBin.fillLevel >= 75 ? 'var(--danger)' : liveBin.fillLevel >= 50 ? 'var(--warning)' : 'var(--text-secondary)', fontWeight: 600 }}>
                                {liveBin.fillLevel}% full · {liveBin.wasteType}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {wp.collected ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                          <CheckCircle2 size={15} /> Done
                        </div>
                      ) : (
                        <button
                          disabled={!!updating}
                          onClick={() => handleCollect(wp.binId?.toString(), wp.locationName)}
                          className="btn btn-primary btn-sm"
                        >
                          {isUpdating ? (
                            <span style={{ width:13,height:13,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:'50%',display:'inline-block'}} className="animate-spin" />
                          ) : (
                            <>Collect <ChevronRight size={13} /></>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {urgentStops.length > 0 && (
                <div className="card" style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger)' }}>
                    <AlertTriangle size={14} /> Urgent collection stops
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    {urgentStops.map(stop => stop.locationName).join(' • ')}
                  </div>
                </div>
              )}

              {/* Complete route button */}
              {allDone && (
                <button
                  disabled={!!updating}
                  onClick={handleComplete}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
                >
                  {updating === 'complete'
                    ? <><span style={{ width:15,height:15,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:'50%',display:'inline-block'}} className="animate-spin" /> Completing…</>
                    : <><CheckCircle2 size={17} /> Return to Depot & Complete</>
                  }
                </button>
              )}
            </>
          )}
        </div>

        {/* RIGHT: Map */}
        <div style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column' }}>
          <div className="card" style={{ flex: 1, minHeight: 480, padding: '0.5rem', overflow: 'hidden' }}>
            <InteractiveMap
              bins={bins}
              vehicles={driverVehicle ? [driverVehicle] : []}
              activeRoute={activeRoute}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
