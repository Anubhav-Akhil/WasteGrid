import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import InteractiveMap from '../components/InteractiveMap';
import {
  Send, MapPin, AlertTriangle, ArrowRight, Shield,
  CheckCircle2, Clock, User, FileText, Search, Lock, Sparkles
} from 'lucide-react';

const WASTE_LEVELS = [
  { label: 'Slightly Full', desc: 'Bin is about half full, may need collection soon.' },
  { label: 'Overflowing', desc: 'Bin is overflowing — waste spilling onto ground.' },
  { label: 'Damaged Bin', desc: 'Bin is broken/damaged and needs repair.' },
  { label: 'Foul Odor', desc: 'Strong odor due to rotting waste inside.' },
];

// ── Recent report card ────────────────────────────────────────────────────────
const ReportCard = ({ rep, index }) => {
  const dt = new Date(rep.createdAt);
  const ago = (() => {
    const diff = (Date.now() - dt.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  })();

  const badgeStyles = {
    Resolved: { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' },
    Dispatched: { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
    Pending: { bg: '#fee2e2', color: '#ef4444', border: '#fecaca' }
  }[rep.status] || { bg: '#e2e8f0', color: '#475569', border: '#cbd5e1' };

  return (
    <div 
      className={`animate-cardReveal delay-${Math.min(index * 75, 450)}`}
      style={{ 
        padding: '0.85rem 1rem', 
        background: 'white', 
        border: '1px solid var(--border-color)', 
        borderLeft: `4px solid ${rep.status === 'Resolved' ? 'var(--primary)' : rep.status === 'Dispatched' ? 'var(--warning)' : 'var(--danger)'}`, 
        borderRadius: '8px',
        boxShadow: 'var(--shadow-xs)',
        transition: 'var(--transition-bounce)',
        cursor: 'default'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)' }} className="truncate">
            {rep.locationName}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Reporter: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{rep.reportedBy}</span> · {ago}
          </div>
        </div>
        <span style={{ 
          fontSize: '0.65rem', 
          fontWeight: 700, 
          padding: '2px 8px', 
          borderRadius: '4px',
          background: badgeStyles.bg,
          color: badgeStyles.color,
          border: `1px solid ${badgeStyles.border}`
        }}>
          {rep.status}
        </span>
      </div>
      {rep.description && (
        <p style={{ 
          fontSize: '0.78rem', 
          color: 'var(--text-secondary)', 
          marginTop: '0.5rem', 
          lineHeight: 1.45,
          background: '#f8fafc',
          padding: '0.4rem 0.6rem',
          borderRadius: '4px',
          border: '1px solid #f1f5f9'
        }}>
          {rep.description}
        </p>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const CitizenPortal = () => {
  const { bins, reports, vehicles, submitReport } = useApp();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [reportedBy, setReportedBy] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [description, setDescription] = useState('');
  const [wasteLevel, setWasteLevel] = useState(WASTE_LEVELS[0].label);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [reportSearch, setReportSearch] = useState('');
  const [instantLoginLoading, setInstantLoginLoading] = useState(false);

  // Instant login helper for demo flow
  const handleInstantDemoLogin = async () => {
    setInstantLoginLoading(true);
    setErrors({});
    try {
      await login('citizen@waste.com', 'citizen123');
    } catch (err) {
      setErrors({ server: err.message || 'Instant authentication failed.' });
    } finally {
      setInstantLoginLoading(false);
    }
  };

  // Map click — receive coordinates from InteractiveMap
  const handleMapClick = (coords) => {
    if (!user) {
      setErrors(prev => ({ ...prev, coords: 'Please sign in to pin location and report.' }));
      return;
    }
    setLatitude(parseFloat(coords.lat.toFixed(6)));
    setLongitude(parseFloat(coords.lng.toFixed(6)));
    setErrors(prev => ({ ...prev, coords: null }));
  };

  // Client-side validation
  const validate = () => {
    const e = {};
    if (!locationName.trim()) e.locationName = 'Please describe the location.';
    if (!description.trim()) e.description = 'Please describe the situation.';
    if (!latitude || !longitude) e.coords = 'Click on the map to select the GPS location.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await submitReport({
        reportedBy: reportedBy.trim() || 'Anonymous Citizen',
        locationName: locationName.trim(),
        latitude,
        longitude,
        description: `[${wasteLevel}] ${description.trim()}`,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setReportedBy(''); setLocationName(''); setLatitude(null); setLongitude(null);
        setDescription(''); setWasteLevel(WASTE_LEVELS[0].label);
        setErrors({});
      }, 3500);
    } catch (err) {
      setErrors({ server: err.message || 'Submission failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered public reports list
  const visibleReports = useMemo(() => {
    const q = reportSearch.toLowerCase();
    const sorted = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (!q) return sorted.slice(0, 8);
    return sorted.filter(r => r.locationName.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)).slice(0, 8);
  }, [reports, reportSearch]);

  const pendingCount = reports.filter(r => r.status === 'Pending').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;
  const criticalBins = useMemo(() => bins.filter(b => b.fillLevel >= 75).slice(0, 3), [bins]);
  const cityCoverage = Math.min(100, Math.round((bins.length / 20) * 100));

  const selectedLocation = latitude && longitude ? { latitude, longitude } : null;

  return (
    <div className="page-wrapper animate-pageIn" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Premium Hero Banner - Deep Tech Dark Navy Theme */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
        padding: '3.5rem 1.5rem', 
        textAlign: 'center', 
        position: 'relative', 
        overflow: 'hidden',
        color: '#f8fafc'
      }}>
        {/* Subtle grid pattern */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)', 
          backgroundSize: '30px 30px', 
          opacity: 0.8, 
          pointerEvents: 'none' 
        }} />
        
        {/* Glowing ambient circles */}
        <div style={{ 
          position: 'absolute', 
          width: '350px', 
          height: '350px', 
          background: 'radial-gradient(circle, rgba(22, 163, 74, 0.15) 0%, transparent 70%)', 
          top: '-180px', 
          left: '10%', 
          pointerEvents: 'none' 
        }} />
        <div style={{ 
          position: 'absolute', 
          width: '350px', 
          height: '350px', 
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', 
          bottom: '-180px', 
          right: '10%', 
          pointerEvents: 'none' 
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <div className="eyebrow" style={{ 
            marginBottom: '0.85rem', 
            background: 'rgba(22, 163, 74, 0.15)', 
            color: '#4ade80', 
            border: '1px solid rgba(74, 222, 128, 0.25)',
            padding: '0.35rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#4ade80', animation: 'pulse-dot 1.5s infinite' }} />
            Public Citizen Console
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(2rem, 4vw, 2.75rem)', 
            fontWeight: 900, 
            color: '#ffffff', 
            marginBottom: '0.75rem', 
            letterSpacing: '-0.03em', 
            lineHeight: 1.15 
          }}>
            WasteGrid City Live Dashboard
          </h1>
          
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '0.98rem', 
            marginBottom: '2.25rem', 
            lineHeight: 1.7, 
            maxWidth: '640px', 
            margin: '0 auto 2.25rem' 
          }}>
            Check the live telemetry of waste containers across Chandigarh. Pinned spots reaching critical capacity trigger automatic dispatch notifications. Log new overflow issues to directly alert dispatcher units.
          </p>

          {/* Quick stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', maxWidth: '580px', margin: '0 auto 2rem' }}>
            {[
              { label: 'Monitored Bins', value: bins.length, color: '#4ade80' },
              { label: 'Active Reports', value: pendingCount, color: '#f87171' },
              { label: 'Resolved Today', value: resolvedCount, color: '#60a5fa' },
            ].map(s => (
              <div key={s.label} style={{ 
                padding: '0.85rem 1rem', 
                background: 'rgba(30, 41, 59, 0.45)', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                backdropFilter: 'blur(8px)',
                borderRadius: '12px', 
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color, marginBottom: '0.2rem' }}>{s.value}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/login', { state: { isLogin: true } })} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontWeight: 600 }}>
              <Shield size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Staff Portal Login
            </button>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="dashboard-grid" style={{ flex: 1, padding: '2rem 1.5rem' }}>

        {/* Map area */}
        <div className="card" style={{ gridColumn: 'span 7', minHeight: 520, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', borderRadius: 'var(--radius-lg)' }}>
          {/* Map header */}
          <div style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 800 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
              Live telemetry map
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              📍 Click map to select GPS coordinates
            </span>
          </div>
          
          <div style={{ flex: 1, position: 'relative' }}>
            <InteractiveMap bins={bins} vehicles={vehicles} reports={reports} onMapClick={handleMapClick} selectedLocation={selectedLocation} />
          </div>
          
          {/* GPS capture bar */}
          {selectedLocation && (
            <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border-color)', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
              <CheckCircle2 size={16} color="var(--primary)" />
              <span style={{ color: 'var(--primary-hover)', fontWeight: 700 }}>Location pinned:</span>
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontWeight: 600 }}>{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
            </div>
          )}
          {errors.coords && (
            <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid rgba(239,68,68,0.2)', background: 'var(--danger-light)', fontSize: '0.8rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <AlertTriangle size={15} /> {errors.coords}
            </div>
          )}
        </div>

        {/* Report form + activity panel */}
        <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* ── Report form ── */}
          <div className="card animate-cardReveal delay-150" style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--navy)' }}>
              <AlertTriangle size={20} color="var(--warning)" /> Report Overflowing Waste
            </h3>
            
            {!user ? (
              <div 
                className="animate-scaleIn"
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  textAlign: 'center', 
                  padding: '2.5rem 1rem', 
                  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                  borderRadius: '12px',
                  border: '1px dashed #cbd5e1',
                  gap: '1rem'
                }}
              >
                <div style={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%', 
                  background: 'rgba(59, 130, 246, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'var(--secondary)', 
                  boxShadow: 'var(--shadow-xs)',
                  alignSelf: 'center'
                }}>
                  <Lock size={22} style={{ alignSelf: 'center' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.35rem' }}>Authentication Required</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    You must be logged in to pin GPS locations on the map and submit waste reports.
                  </p>
                </div>
                
                {errors.server && (
                  <div style={{ background: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                    <AlertTriangle size={12} /> {errors.server}
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '0.6rem' }}>
                  <button 
                    onClick={handleInstantDemoLogin} 
                    disabled={instantLoginLoading}
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 700 }}
                  >
                    {instantLoginLoading ? (
                      <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%' }} className="animate-spin" />
                    ) : (
                      <>⚡ One-Click Demo Citizen Login</>
                    )}
                  </button>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => navigate('/login', { state: { isLogin: true } })} 
                      className="btn btn-secondary btn-sm" 
                      style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--border-color)', fontWeight: 600 }}
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => navigate('/login', { state: { isLogin: false } })} 
                      className="btn btn-secondary btn-sm" 
                      style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--border-color)', fontWeight: 600 }}
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Pin the coordinates on the map, provide details, and submit to dispatch municipal crews.
                </p>

                {/* Success overlay */}
                {submitted && (
                  <div className="animate-scaleIn" style={{ background: 'var(--primary-50)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <CheckCircle2 size={32} color="var(--primary)" />
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-hover)' }}>Report Submitted Successfully!</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Thank you! The complaint has been registered and scheduled for active routing.
                    </div>
                  </div>
                )}

                {/* Server error */}
                {errors.server && (
                  <div className="animate-slideUp" style={{ background: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                    <AlertTriangle size={14} /> {errors.server}
                  </div>
                )}

                {!submitted && (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.78rem' }}><User size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Your Name (Optional)</label>
                      <div className="input-wrapper">
                        <span className="input-icon-left"><User size={15} /></span>
                        <input type="text" placeholder="Anonymous Citizen" className="form-input has-icon-left" value={reportedBy} onChange={e => setReportedBy(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.78rem' }}><MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Location / Landmark *</label>
                      <div className="input-wrapper">
                        <span className="input-icon-left"><MapPin size={15} /></span>
                        <input type="text" required placeholder="E.g. Shastri Market Gate" className={`form-input has-icon-left ${errors.locationName ? 'error' : ''}`} value={locationName} onChange={e => { setLocationName(e.target.value); setErrors(prev => ({ ...prev, locationName: null })); }} />
                      </div>
                      {errors.locationName && <div className="form-error"><AlertTriangle size={11} />{errors.locationName}</div>}
                    </div>

                    {/* GPS coordinates */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: 600 }}>Latitude</label>
                        <input type="number" step="0.000001" placeholder="Click Map" className={`form-input ${errors.coords ? 'error' : ''}`} style={{ fontSize: '0.8rem' }} value={latitude ?? ''} onChange={e => setLatitude(parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: 600 }}>Longitude</label>
                        <input type="number" step="0.000001" placeholder="Click Map" className={`form-input ${errors.coords ? 'error' : ''}`} style={{ fontSize: '0.8rem' }} value={longitude ?? ''} onChange={e => setLongitude(parseFloat(e.target.value))} />
                      </div>
                    </div>

                    {/* Severity selector */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.78rem' }}><AlertTriangle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Report Type / Severity</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {WASTE_LEVELS.map(lvl => (
                          <button key={lvl.label} type="button" onClick={() => setWasteLevel(lvl.label)}
                            style={{ 
                              padding: '0.5rem 0.6rem', 
                              borderRadius: '8px', 
                              border: `1px solid ${wasteLevel === lvl.label ? 'var(--primary)' : 'var(--border-color)'}`, 
                              background: wasteLevel === lvl.label ? 'var(--primary-50)' : 'white', 
                              color: wasteLevel === lvl.label ? 'var(--primary)' : 'var(--text-secondary)', 
                              fontSize: '0.72rem', 
                              fontWeight: 700, 
                              cursor: 'pointer', 
                              transition: 'all 0.15s ease', 
                              textAlign: 'left',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              boxShadow: wasteLevel === lvl.label ? '0 2px 4px rgba(22, 163, 74, 0.05)' : 'none'
                            }}
                            title={lvl.desc}
                          >
                            <span>{lvl.label}</span>
                            <span style={{ fontSize: '0.6rem', fontWeight: 400, color: 'var(--text-muted)' }} className="truncate">
                              {lvl.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.78rem' }}><FileText size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Description / Details *</label>
                      <textarea required placeholder="Explain situation (e.g. bin fully overflowed)..." className={`form-textarea ${errors.description ? 'error' : ''}`} style={{ resize: 'none', minHeight: 70, fontSize: '0.82rem' }} value={description} onChange={e => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: null })); }} />
                      {errors.description && <div className="form-error"><AlertTriangle size={11} />{errors.description}</div>}
                    </div>

                    <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', fontWeight: 700 }}>
                      {submitting
                        ? <><span style={{ width:15,height:15,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:'50%',display:'inline-block'}} className="animate-spin" /> Submitting…</>
                        : <><Send size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Submit Report</>
                      }
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          {/* ── Recent Reports Activity ── */}
          <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h4 style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: 'var(--navy)' }}>
                <Clock size={15} color="var(--primary)" /> Public Report Stream
              </h4>
              <div className="search-input-wrap">
                <Search size={12} className="search-icon" />
                <input className="search-input" style={{ width: 140, fontSize: '0.75rem', padding: '0.35rem 0.6rem 0.35rem 1.85rem' }} placeholder="Search..." value={reportSearch} onChange={e => setReportSearch(e.target.value)} />
              </div>
            </div>
            {visibleReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No public reports recorded yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: 240, overflowY: 'auto' }}>
                {visibleReports.map((r, idx) => <ReportCard key={r._id} rep={r} index={idx} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenPortal;
