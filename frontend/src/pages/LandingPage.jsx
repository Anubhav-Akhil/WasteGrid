import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf, ArrowRight, Shield, Truck, Globe, Trash2, Zap,
  CheckCircle2, Clock, AlertTriangle, FileText, BarChart3,
  Sparkles, MessageSquare, CreditCard, Layers, ArrowDown,
  XCircle, Check, Building2, MapPin
} from 'lucide-react';
import WasteGridLogo from '../components/WasteGridLogo';

const marqueeItems = [
  { label: 'Citizen Portal', icon: <Globe size={18} /> },
  { label: 'Route Planning', icon: <Layers size={18} /> },
  { label: 'AI Dispatcher', icon: <Sparkles size={18} /> },
  { label: 'Vehicle Tracking', icon: <Truck size={18} /> },
  { label: 'Analytical Reports', icon: <BarChart3 size={18} /> },
  { label: 'Auto Dispatch', icon: <Zap size={18} /> },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--bg-primary)', position: 'relative' }}>
      
      {/* Subtle background grid pattern */}
      <div style={{ 
        position: 'absolute', 
        inset: '0 0 auto 0', 
        height: '1000px',
        backgroundImage: 'linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)', 
        backgroundSize: '40px 40px', 
        opacity: 0.7, 
        pointerEvents: 'none' 
      }} />

      {/* ─── HEADER ─── */}
      <header style={{
        position: 'relative', zIndex: 10,
        height: '68px', display: 'flex', alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
      }}>
        <div className="container-lg" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <WasteGridLogo size={24} color="var(--primary)" />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>
              WasteGrid
            </span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <span onClick={() => document.getElementById('portals')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer' }}>Portals</span>
            <span onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer' }}>Features</span>
            <span onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer' }}>Solutions</span>
            <span onClick={() => document.getElementById('problems')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer' }}>Problems</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => navigate('/login', { state: { isLogin: true } })} className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>
              Log in
            </button>
            <button onClick={() => navigate('/login', { state: { isLogin: false } })} className="btn btn-primary btn-sm">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '5rem 0 7rem' }}>
        <div className="container-lg" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem', alignItems: 'center' }}>
          
          {/* Hero Left Content */}
          <div style={{ maxWidth: '640px' }}>
            <span className="eyebrow" style={{ display: 'inline-block', marginBottom: '1.25rem' }}>
              Smart Waste Management & Logistics
            </span>
            <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', color: 'var(--navy)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
              The operating system for modern waste collection
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '2.5rem' }}>
              Municipal authorities and waste management agencies run their entire operation on one platform — citizen reporting, route optimization, vehicle tracking, and analytics in a single unified data model.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => navigate('/login', { state: { isLogin: true } })} className="btn btn-primary btn-lg" style={{ background: 'var(--primary)', padding: '0.85rem 2rem' }}>
                Explore platform
              </button>
              <button onClick={() => navigate('/login', { state: { isLogin: false } })} className="btn btn-secondary btn-lg" style={{ border: '1px solid var(--border-color)', padding: '0.85rem 2rem' }}>
                Get Started
              </button>
            </div>

            {/* Logo Row: Swapped generic text with styled WasteGrid partners */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '4rem', flexWrap: 'wrap' }}>
              {[
                { name: 'Chandigarh MC', icon: <Building2 size={14} /> },
                { name: 'Urban SmartGrid', icon: <Layers size={14} /> },
                { name: 'EcoLogix India', icon: <Leaf size={14} /> },
                { name: 'CleanCity Initiative', icon: <Globe size={14} /> }
              ].map((logo, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', opacity: 0.85, boxShadow: 'var(--shadow-xs)' }}>
                  <div style={{ color: 'var(--primary)' }}>{logo.icon}</div>
                  <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.78rem', letterSpacing: '-0.01em' }}>{logo.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Right Mockups (Laptop + Phone overlap) */}
          <div style={{ position: 'relative', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* 💻 Laptop Mockup behind */}
            <div style={{
              width: '490px',
              height: '330px',
              background: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-xl)',
              position: 'absolute',
              right: '20px',
              top: '20px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 1,
            }}>
              {/* Fake Chrome Top Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                <div style={{ flex: 1, background: 'white', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1px 0', margin: '0 2rem' }}>
                  wastegrid.app/dashboard
                </div>
              </div>

              {/* Laptop Content Split */}
              <div style={{ flex: 1, display: 'flex' }}>
                {/* Mock Sidebar */}
                <div style={{ width: '110px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ height: 12, background: '#e2e8f0', borderRadius: 3, width: '80%' }} />
                  <div style={{ height: 10, background: 'var(--primary-light)', borderRadius: 3, width: '90%' }} />
                  <div style={{ height: 10, background: '#e2e8f0', borderRadius: 3, width: '60%' }} />
                  <div style={{ height: 10, background: '#e2e8f0', borderRadius: 3, width: '70%' }} />
                </div>

                {/* Mock Main Dashboard View */}
                <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Dashboard stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>MONITORED BINS</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)' }}>764</div>
                    </div>
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE TRUCKS</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)' }}>12 / 15</div>
                    </div>
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>PENDING REPORTS</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)' }}>8</div>
                    </div>
                  </div>

                  {/* Mock Charts */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.5rem', flex: 1 }}>
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-secondary)' }}>WEEKLY TICKET LOGS</span>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', flex: 1, height: '40px' }}>
                        {[30, 45, 60, 40, 75, 50, 90, 65, 80].map((h, idx) => (
                          <div key={idx} style={{ flex: 1, height: `${h}%`, background: 'var(--primary)', borderRadius: '2px', opacity: 0.8 }} />
                        ))}
                      </div>
                    </div>
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-secondary)', alignSelf: 'flex-start' }}>WASTE SPLIT</span>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '8px solid var(--primary)', borderRightColor: 'var(--secondary)', borderBottomColor: '#e2e8f0', marginTop: '4px' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 📱 Mobile Phone Mockup in front overlapping left side of laptop */}
            <div style={{
              width: '180px',
              height: '350px',
              background: 'white',
              border: '6px solid var(--navy)',
              borderRadius: '24px',
              boxShadow: 'var(--shadow-xl)',
              position: 'absolute',
              left: '10px',
              bottom: '-20px',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              {/* Phone Speaker/Camera notch */}
              <div style={{ background: 'var(--navy)', height: '14px', width: '90px', alignSelf: 'center', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }} />
              
              {/* Phone Content */}
              <div style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <WasteGridLogo size={12} color="var(--primary)" />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--navy)' }}>WasteGrid</span>
                </div>
                
                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>
                  Self-service
                </span>
                
                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1.2 }}>
                  Request public container emptying
                </h4>

                {/* 2x2 grid features */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.25rem' }}>
                  {[
                    { label: 'Extra empty', icon: '🗑️' },
                    { label: 'Bulk waste', icon: '📦' },
                    { label: 'Add bin', icon: '➕' },
                    { label: 'Report foul', icon: '🤢' },
                  ].map((x, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem 0.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <span style={{ fontSize: '0.9rem' }}>{x.icon}</span>
                      <span style={{ fontSize: '0.45rem', fontWeight: 700, color: 'var(--navy)' }}>{x.label}</span>
                    </div>
                  ))}
                </div>

                {/* List items below grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.25rem' }}>
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 6px', fontSize: '0.5rem', fontWeight: 600, display: 'flex', justifyContet: 'space-between', alignItems: 'center' }}>
                    <span>📬 SMS Notifications</span>
                  </div>
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 6px', fontSize: '0.5rem', fontWeight: 600, display: 'flex', justifyContet: 'space-between', alignItems: 'center' }}>
                    <span>🔧 Container repair</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── TICKER / SEAMLESS INFINITE MARQUEE BAR ─── */}
      <section id="marquee" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', background: 'white', padding: '1.25rem 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', width: '100%', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: '4rem', whiteSpace: 'nowrap', animation: 'marquee 25s linear infinite', flexShrink: 0, minWidth: '100%', justifyContent: 'space-around' }}>
            {marqueeItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {item.icon}
                <span>{item.label}</span>
                <span style={{ marginLeft: '1.5rem', color: 'var(--border-color)', fontWeight: 300 }}>|</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '4rem', whiteSpace: 'nowrap', animation: 'marquee 25s linear infinite', flexShrink: 0, minWidth: '100%', justifyContent: 'space-around' }} aria-hidden="true">
            {marqueeItems.map((item, idx) => (
              <div key={`dup-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {item.icon}
                <span>{item.label}</span>
                <span style={{ marginLeft: '1.5rem', color: 'var(--border-color)', fontWeight: 300 }}>|</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE PROBLEM SECTION (Scattered Animated Tags & Professional Table Animation) ─── */}
      <section id="problems" className="section" style={{ background: 'white' }}>
        <div className="container-lg" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem', alignItems: 'center' }}>
          
          {/* Left Content (Animated Comparison of Waste logistics) */}
          <div className="animate-fadeIn">
            <span className="eyebrow" style={{ display: 'inline-block', marginBottom: '1rem' }}>
              Operational bottlenecks
            </span>
            <h2 style={{ fontSize: '2.40rem', color: 'var(--navy)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '1.5rem', lineHeight: 1.2 }}>
              The cost of fragmented waste infrastructure
            </h2>
            
            {/* Professional comparison grid with lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ borderLeft: '3px solid var(--danger)', paddingLeft: '1rem', transition: 'all 0.3s ease' }} className="tag-float-1">
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <XCircle size={15} color="var(--danger)" /> Fragmented Legacy Methods
                </h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Disconnected spreadsheets, fixed weekly driver routes, unmonitored container levels, and paper complaints lead to high fuel costs and missed pickups.
                </p>
              </div>

              <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem', transition: 'all 0.3s ease' }} className="tag-float-3">
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={15} color="var(--primary)" /> Optimized WasteGrid Infrastructure
                </h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  All nodes synced in real-time. Smart nearest-neighbor pathfinding optimizes routes on the fly, reducing fuel usage by 30% while dispatching crews directly.
                </p>
              </div>
            </div>
          </div>

          {/* Right Content (Scattered Animated Tag Cloud) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            
            {/* Tag Cloud Relative Container */}
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              height: '240px', 
              border: '1px dashed #cbd5e1', 
              borderRadius: '16px', 
              background: 'var(--bg-secondary)',
              overflow: 'hidden'
            }}>
              
              {/* Scattered tags with floating keyframes */}
              <span className="tag-float-1" style={{ position: 'absolute', top: '15%', left: '10%', background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.85rem', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}>
                Static spreadsheets
              </span>

              <span className="tag-float-2" style={{ position: 'absolute', top: '8%', left: '52%', background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.85rem', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}>
                Fixed schedules
              </span>

              <span className="tag-float-3" style={{ position: 'absolute', top: '38%', left: '35%', background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.85rem', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}>
                Manual route logs
              </span>

              <span className="tag-float-4" style={{ position: 'absolute', top: '36%', left: '72%', background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.85rem', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}>
                Paper complaints
              </span>

              <span className="tag-float-5" style={{ position: 'absolute', top: '65%', left: '8%', background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.85rem', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}>
                Unmonitored bins
              </span>

              <span className="tag-float-6" style={{ position: 'absolute', top: '68%', left: '48%', background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.85rem', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}>
                Fuel waste
              </span>

              <span className="tag-float-7" style={{ position: 'absolute', top: '72%', left: '75%', background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.85rem', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}>
                Phone complaints
              </span>
            </div>
            
            {/* Down Arrow */}
            <div style={{ color: 'var(--text-muted)' }} className="tag-float-4">
              <ArrowDown size={28} />
            </div>

            {/* Unified Platform Bar */}
            <div style={{ background: 'var(--navy)', color: 'white', padding: '1rem 2rem', borderRadius: '12px', width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center' }}>
                <Leaf size={18} color="var(--primary)" />
                <span style={{ fontWeight: 800, letterSpacing: '0.02em', fontSize: '1.05rem' }}>WasteGrid — One unified platform</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── THE SOLUTION / 3 PILLARS SECTION ─── */}
      <section id="solutions" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container-lg">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 4rem' }}>
            <span className="eyebrow" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
              The Solution
            </span>
            <h2 style={{ fontSize: '2.25rem', color: 'var(--navy)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
              Three pillars. One unified system.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Move operations off paper and spreadsheets. Optimise them with live telemetry data. Unify roles across the organisation.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
            {[
              { title: 'Simplify', icon: <Zap size={22} color="var(--primary)" />, desc: 'For admins, drivers, and citizens. A streamlined dashboard that maps collection waypoints instantly. Citizens report overflow spots with a simple map click.' },
              { title: 'Improve', icon: <BarChart3 size={22} color="var(--secondary)" />, desc: 'Operations efficiency. Nearest-neighbor pathfinding optimizes collector routes. Fuel usage drops while neighborhood cleanliness levels spike.' },
              { title: 'Unify', icon: <Layers size={22} color="var(--accent)" />, desc: 'The entire waste value chain on one data model. One platform replacing five to seven systems. One source of truth for citizens, containers, vehicles, drivers, routes, and invoices.' },
            ].map((p, idx) => (
              <div key={idx} style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  {p.icon}
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.75rem' }}>{p.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CORE FEATURES GRID SECTION ─── */}
      <section id="features" className="section" style={{ background: 'white', borderBottom: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container-lg">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 4rem' }}>
            <span className="eyebrow" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
              Key Capabilities
            </span>
            <h2 style={{ fontSize: '2.25rem', color: 'var(--navy)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
              Advanced features built for scale
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Everything you need to automate municipal collection workflows and monitor container networks.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              { title: 'Dynamic Routing', icon: <Layers size={20} color="var(--primary)" />, desc: 'Computes optimized driver navigation paths dynamically based on container fill levels, bypassing empty locations.' },
              { title: 'Live Container Telemetry', icon: <Zap size={20} color="var(--primary)" />, desc: 'Monitors public waste containers in real time with hardware sensor integrations, forecasting fill velocities.' },
              { title: 'Citizen Reporting', icon: <MessageSquare size={20} color="var(--primary)" />, desc: 'Empowers citizens to file overflow alerts, uploading geo-tagged details that populate dispatch queues instantly.' },
              { title: 'Automated Dispatch', icon: <Truck size={20} color="var(--primary)" />, desc: 'Matches reported collection requests with nearby vehicles automatically, minimizing dispatch paperwork.' },
              { title: 'B2B Analytics Panel', icon: <BarChart3 size={20} color="var(--primary)" />, desc: 'Generates reports on fleet fuel consumption, pickup success rates, payload distributions, and sector performance.' },
              { title: 'Municipal Invoicing', icon: <CreditCard size={20} color="var(--primary)" />, desc: 'Automates contract billing and invoice scheduling based on verified collection logs and dumpster weight payloads.' },
            ].map((f, idx) => (
              <div key={idx} style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: 'var(--shadow-xs)', color: 'var(--primary)' }}>
                  {f.icon}
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem' }}>{f.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORM MODES / PRODUCTS (Operations, Navigation, Citizen) ─── */}
      <section id="portals" className="section" style={{ background: 'white' }}>
        <div className="container-lg">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 5rem' }}>
            <span className="eyebrow" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
              Our portals
            </span>
            <h2 style={{ fontSize: '2.25rem', color: 'var(--navy)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
              One platform, three ways to work
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              From the back office to the driver's cab to the citizen's phone — three portals, one connected database.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '7rem' }}>
            {/* 1. Operations console */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>
              <div>
                <span className="eyebrow" style={{ display: 'inline-block', marginBottom: '1rem' }}>Operations console</span>
                <h3 style={{ fontSize: '1.85rem', color: 'var(--navy)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                  Run the whole operation from one screen
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.025rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                  Tickets, routes, containers, billing, and municipal analytics in a single console. Office staff and planners work from one source of truth instead of switching between six systems.
                </p>
                <button onClick={() => navigate('/login')} className="btn btn-secondary btn-sm" style={{ fontWeight: 700 }}>
                  Access Operations Portal <ArrowRight size={14} />
                </button>
              </div>
              
              {/* High-Fidelity B2B Operations Dashboard Board */}
              <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '0.65rem', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', height: '280px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {/* Header Actions bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem', fontSize: '0.55rem', fontWeight: 800 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--navy)', fontSize: '0.65rem', fontWeight: 900 }}>🎫 Tickets</span>
                    <span style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: '3px', color: 'var(--text-secondary)' }}>Filters</span>
                    <span style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: '3px', color: 'var(--text-secondary)' }}>Actions</span>
                  </div>
                  <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>+ Create Ticket</span>
                </div>
                
                {/* Grid columns */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.1fr 1.1fr 1.1fr 1fr', gap: '0.4rem', overflow: 'hidden' }}>
                  
                  {/* Column 1: New */}
                  <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.48rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', justifyContet: 'space-between' }}>
                      <span>New</span>
                      <span style={{ color: 'var(--text-muted)' }}>1</span>
                    </div>
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px', boxShadow: 'var(--shadow-xs)' }}>
                      <span style={{ fontSize: '0.45rem', fontWeight: 800, color: 'var(--navy)' }}>Sector 22 Market, CH</span>
                      <span style={{ fontSize: '0.38rem', color: 'var(--text-secondary)' }}>ID: 138R • Paper • 120L</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.3rem', fontWeight: 800 }}>JN</div>
                        <span style={{ fontSize: '0.35rem', color: 'var(--text-secondary)' }}>Jack Nelson</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Open */}
                  <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.48rem', fontWeight: 800, color: '#991b1b', display: 'flex', justifyContet: 'space-between' }}>
                      <span>Open</span>
                      <span style={{ color: '#fca5a5' }}>1</span>
                    </div>
                    <div style={{ background: 'white', border: '1px solid #fee2e2', borderRadius: '6px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px', boxShadow: 'var(--shadow-xs)' }}>
                      <span style={{ fontSize: '0.45rem', fontWeight: 800, color: 'var(--navy)' }}>Sec 35 Industrial, CH</span>
                      <span style={{ fontSize: '0.38rem', color: 'var(--text-secondary)' }}>ID: 673F • General • 1100L</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.3rem', fontWeight: 800 }}>JN</div>
                        <span style={{ fontSize: '0.35rem', color: 'var(--text-secondary)' }}>Jack Nelson</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: In Progress */}
                  <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.48rem', fontWeight: 800, color: '#1e40af', display: 'flex', justifyContet: 'space-between' }}>
                      <span>In Progress</span>
                      <span style={{ color: '#93c5fd' }}>1</span>
                    </div>
                    <div style={{ background: 'white', border: '1px solid #dbeafe', borderRadius: '6px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px', boxShadow: 'var(--shadow-xs)' }}>
                      <span style={{ fontSize: '0.45rem', fontWeight: 800, color: 'var(--navy)' }}>Sector 17 Plaza, CH</span>
                      <span style={{ fontSize: '0.38rem', color: 'var(--text-secondary)' }}>ID: 125L • Organic • 240L</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.3rem', fontWeight: 800 }}>JN</div>
                        <span style={{ fontSize: '0.35rem', color: 'var(--text-secondary)' }}>Jack Nelson</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 4: Notifications (Sidebar) */}
                  <div style={{ background: '#f8fafc', borderLeft: '1px solid #e2e8f0', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.45rem', fontWeight: 800, color: 'var(--navy)', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px' }}>Notifications</span>
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '3px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                      <span style={{ fontSize: '0.38rem', fontWeight: 800, color: 'var(--navy)' }}>Ticket #000123</span>
                      <span style={{ fontSize: '0.32rem', color: 'var(--text-secondary)' }}>Karan S. changed status from New to Open</span>
                      <span style={{ fontSize: '0.3rem', color: 'var(--text-muted)' }}>Just Now</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* 2. Navigation App */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>
              <div style={{ order: 2 }}>
                <span className="eyebrow" style={{ display: 'inline-block', marginBottom: '1rem' }}>Navigation app</span>
                <h3 style={{ fontSize: '1.85rem', color: 'var(--navy)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                  Turn-by-turn collection for every driver
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.025rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                  In-cab navigation guides drivers stop to stop, syncs every task change in real time, and keeps central dispatchers automatically informed — no paperwork, no "where's my pickup?" calls.
                </p>
                <button onClick={() => navigate('/login')} className="btn btn-secondary btn-sm" style={{ fontWeight: 700 }}>
                  Access Driver Console <ArrowRight size={14} />
                </button>
              </div>
              <div style={{ order: 1, position: 'relative', width: '500px', height: '380px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
                {/* 🚚 Background Photo: Garbage truck lifting container */}
                <img 
                  src="/garbage_lifting.png" 
                  alt="Garbage Truck Lifting" 
                  style={{ position: 'absolute', top: '20px', left: '120px', width: '280px', height: '180px', borderRadius: '12px', zIndex: 1, objectFit: 'cover', boxShadow: 'var(--shadow-md)' }}
                />

                {/* 💻 Tablet mockup showing high-fidelity route map */}
                <div style={{ position: 'absolute', top: '190px', left: '10px', width: '275px', height: '175px', zIndex: 3, background: 'white', borderRadius: '12px', border: '5px solid var(--navy)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Chrome tab */}
                  <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                    </div>
                    <span style={{ fontSize: '0.52rem', color: 'var(--text-secondary)', fontWeight: 600 }}>wastegrid.app/routes/sector22</span>
                    <span style={{ fontSize: '0.48rem', background: '#e2e8f0', padding: '1px 4px', borderRadius: '3px', color: 'var(--navy)' }}>GPS Locked</span>
                  </div>
                  {/* Split Screen Layout */}
                  <div style={{ flex: 1, display: 'flex', background: '#f1f5f9' }}>
                    {/* Left route sidebar */}
                    <div style={{ width: '95px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '0.48rem', fontWeight: 800, color: 'var(--navy)', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Sector 22</span>
                        <span style={{ color: 'var(--primary)' }}>3 Bins</span>
                      </div>
                      <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '4px', padding: '3px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{ fontSize: '0.4rem', fontWeight: 800, color: '#991b1b' }}>BIN-104 (Market)</span>
                        <span style={{ fontSize: '0.35rem', color: '#b91c1c' }}>Fill: 84% • General</span>
                      </div>
                      <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '4px', padding: '3px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{ fontSize: '0.4rem', fontWeight: 800, color: '#92400e' }}>BIN-105 (Plaza)</span>
                        <span style={{ fontSize: '0.35rem', color: '#b45309' }}>Fill: 92% • Organic</span>
                      </div>
                    </div>
                    {/* Right Map view */}
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#f1f5f9' }}>
                      {/* Grid background representing roads */}
                      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.8 }} />
                      
                      {/* Dotted Route */}
                      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                        <path d="M 15,115 C 45,75 90,85 110,130 C 130,130 150,90 145,25" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="3" />
                      </svg>
                      
                      {/* Marker labels */}
                      <div style={{ position: 'absolute', top: '105px', left: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ background: '#ef4444', color: 'white', fontSize: '0.35rem', fontWeight: 800, padding: '1px 3px', borderRadius: '3px', boxShadow: 'var(--shadow-sm)' }}>BIN-104</div>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', border: '1px solid white' }} />
                      </div>

                      <div style={{ position: 'absolute', top: '75px', left: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ background: '#f59e0b', color: 'white', fontSize: '0.35rem', fontWeight: 800, padding: '1px 3px', borderRadius: '3px', boxShadow: 'var(--shadow-sm)' }}>BIN-105</div>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', border: '1px solid white' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 📱 Right smartphone photo showing overflowing bin with high-fidelity banner overlay */}
                <div style={{ position: 'absolute', top: '60px', left: '320px', width: '130px', height: '200px', borderRadius: '16px', border: '4px solid var(--navy)', zIndex: 2, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                  <img 
                    src="/overflowing_bin.png" 
                    alt="Overflowing Trash Bin" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(239, 68, 68, 0.95)', color: 'white', padding: '6px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '0.45rem', fontWeight: 800, letterSpacing: '0.05em' }}>⚠️ CRITICAL OVERFLOW</span>
                    <span style={{ fontSize: '0.38rem', opacity: 0.9 }}>Reported by Citizen • Sector 22 Market</span>
                  </div>
                </div>

                {/* 🎟️ Ongoing Route Overlay Card - Custom Styled B2B Console */}
                <div style={{ position: 'absolute', top: '290px', left: '160px', width: '220px', zIndex: 4, background: 'linear-gradient(135deg, var(--navy) 0%, #1e293b 100%)', color: 'white', borderRadius: '12px', padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.02em' }}>ACTIVE COLLECTOR</span>
                    <span style={{ fontSize: '0.48rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '1px 5px', borderRadius: '10px', fontWeight: 700 }}>Active</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'white' }}>Route #CH-Sector22</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.52rem', color: 'var(--text-on-dark-muted)', marginTop: '0.1rem' }}>
                    <span>Payload: 7.4 Tons</span>
                    <span>Driver: Karan S.</span>
                  </div>
                  <div className="progress-bar-wrap" style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '0.2rem' }}>
                    <div className="progress-bar-fill" style={{ width: '84%', background: 'var(--primary)', height: '100%', borderRadius: '2px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.48rem', color: 'var(--text-on-dark-muted)', marginTop: '0.1rem' }}>
                    <span>84% Completed</span>
                    <span>Next: BIN-105</span>
                  </div>
                </div>

                {/* 🔵 Pill Badge 1: Report overflow */}
                <div style={{ position: 'absolute', top: '20px', left: '335px', zIndex: 5, background: '#3b82f6', color: 'white', fontWeight: 800, padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.68rem', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>Report overflow</span>
                </div>

                {/* 🔵 Pill Badge 2: Optimize path */}
                <div style={{ position: 'absolute', top: '140px', left: '10px', zIndex: 5, background: 'var(--navy)', color: 'white', fontWeight: 800, padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.68rem', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>Optimize path</span>
                </div>

                {/* SVG Connecting Flow Arrows */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 4 }}>
                  <defs>
                    <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L6,3 Z" fill="#3b82f6" />
                    </marker>
                    <marker id="arrow-navy" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L6,3 Z" fill="var(--navy)" />
                    </marker>
                  </defs>
                  
                  {/* Arrow 1: Smartphone -> Blue Badge */}
                  <path d="M 330,90 Q 320,50 332,38" fill="none" stroke="#3b82f6" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />
                  
                  {/* Arrow 2: Blue Badge -> Tablet Map */}
                  <path d="M 335,38 Q 230,50 245,185" fill="none" stroke="#3b82f6" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />
                  
                  {/* Arrow 3: Tablet Map -> Truck photo */}
                  <path d="M 140,190 Q 170,130 205,140" fill="none" stroke="var(--navy)" strokeWidth="2.5" markerEnd="url(#arrow-navy)" />
                  
                  {/* Arrow 4: Truck -> Ongoing Route card */}
                  <path d="M 360,110 Q 430,190 355,285" fill="none" stroke="var(--navy)" strokeWidth="2.5" markerEnd="url(#arrow-navy)" />
                </svg>
              </div>
            </div>

            {/* 3. Citizen self-service */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>
              <div>
                <span className="eyebrow" style={{ display: 'inline-block', marginBottom: '1rem' }}>Citizen portal</span>
                <h3 style={{ fontSize: '1.85rem', color: 'var(--navy)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                  Self-service for citizens and communities
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.025rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                  Give citizens and customers their own portal to search public container fill levels, raise tickets, and request collections — cutting inbound support calls while service gets faster and more transparent.
                </p>
                <button onClick={() => navigate('/citizen')} className="btn btn-secondary btn-sm" style={{ fontWeight: 700 }}>
                  Access Citizen Portal <ArrowRight size={14} />
                </button>
              </div>
              <div style={{ position: 'relative', width: '500px', height: '400px', margin: '0 auto' }}>
                {/* 👩 Citizen Photo: Woman using phone */}
                <img 
                  src="/citizen_phone.png" 
                  alt="Citizen Using App" 
                  style={{ position: 'absolute', top: '20px', left: '10px', width: '150px', height: '170px', borderRadius: '12px', objectFit: 'cover', zIndex: 1, boxShadow: 'var(--shadow-md)' }}
                />

                {/* 📱 Center Phone Mockup showing high-fidelity citizen application */}
                <div style={{ position: 'absolute', top: '10px', left: '175px', width: '150px', height: '245px', background: 'white', border: '5px solid var(--navy)', borderRadius: '20px', zIndex: 3, boxShadow: 'var(--shadow-xl)', overflow: 'hidden', padding: '0.4rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {/* notch */}
                  <div style={{ background: 'var(--navy)', height: '10px', width: '60px', alignSelf: 'center', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px', marginTop: '-5px', marginBottom: '2px' }} />
                  <span style={{ fontSize: '0.52rem', fontWeight: 900, color: 'var(--navy)', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>WasteGrid Citizen</span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden', flex: 1 }}>
                    {[
                      { name: 'Sector 22 Market', type: 'Organic • Fill: 32%', ok: true },
                      { name: 'Sector 22 Plaza', type: 'Recyclable • Fill: 88%', warn: true },
                      { name: 'Sector 17 Plaza', type: 'General • Fill: 45%', ok: true }
                    ].map((c, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '0.42rem', fontWeight: 800, color: 'var(--navy)' }}>{c.name}</div>
                          <div style={{ fontSize: '0.35rem', color: 'var(--text-secondary)' }}>{c.type}</div>
                        </div>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.warn ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.35rem' }}>
                          {c.warn ? '!' : '✓'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Citizen Quick Report CTA */}
                  <div style={{ background: '#ef4444', color: 'white', fontSize: '0.48rem', fontWeight: 800, padding: '4px', borderRadius: '6px', textAlign: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                    🚨 Report Overflow Alert
                  </div>
                </div>

                {/* 💻 Right Tablet Mockup: Dashboard map displaying overflow alert zones */}
                <div style={{ position: 'absolute', top: '200px', left: '300px', width: '190px', height: '145px', background: 'white', border: '4px solid var(--navy)', borderRadius: '12px', zIndex: 2, boxShadow: 'var(--shadow-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Tablet Titlebar */}
                  <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.48rem', fontWeight: 800, color: 'var(--navy)' }}>📍 Chandigarh Central SmartGrid</span>
                    <span style={{ fontSize: '0.42rem', color: '#10b981', fontWeight: 700 }}>2 Alerts Active</span>
                  </div>
                  {/* Map background */}
                  <div style={{ background: '#f1f5f9', flex: 1, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                    {/* Glowing overflow alert zone */}
                    <div style={{ position: 'absolute', top: '55px', left: '75px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ position: 'absolute', width: '20px', height: '20px', background: 'rgba(239,68,68,0.25)', borderRadius: '50%', animation: 'ping 1.5s infinite' }} />
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', border: '1px solid white' }} />
                    </div>
                    {/* Standard marker */}
                    <div style={{ position: 'absolute', top: '85px', left: '135px', width: 5, height: 5, borderRadius: '50%', background: '#10b981', border: '1px solid white' }} />
                    {/* Map Labels */}
                    <span style={{ position: 'absolute', top: '42px', left: '60px', fontSize: '0.32rem', color: '#7f1d1d', fontWeight: 800, background: '#fef2f2', padding: '1px 2px', borderRadius: '2px', border: '1px solid #fee2e2' }}>Sec 22 Overflow</span>
                  </div>
                </div>

                {/* 🚛 Bottom photo: Garbage truck driving */}
                <img 
                  src="/garbage_truck.png" 
                  alt="Garbage Truck Road" 
                  style={{ position: 'absolute', top: '290px', left: '135px', width: '230px', height: '110px', borderRadius: '12px', objectFit: 'cover', zIndex: 4, boxShadow: 'var(--shadow-xl)' }}
                />

                {/* 🔵 Pill Badge 1: Request collection */}
                <div style={{ position: 'absolute', top: '60px', left: '335px', zIndex: 5, background: '#3b82f6', color: 'white', fontWeight: 800, padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.68rem', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>Request collection</span>
                </div>

                {/* 🔵 Pill Badge 2: Optimize route */}
                <div style={{ position: 'absolute', top: '290px', left: '48px', zIndex: 5, background: 'var(--navy)', color: 'white', fontWeight: 800, padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.68rem', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>Optimize route</span>
                </div>

                {/* SVG Connecting Flow Arrows */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 4 }}>
                  <defs>
                    <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L6,3 Z" fill="#3b82f6" />
                    </marker>
                    <marker id="arrow-navy" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L6,3 Z" fill="var(--navy)" />
                    </marker>
                  </defs>
                  
                  {/* Arrow 1: Phone -> Blue Badge */}
                  <path d="M 305,100 Q 320,80 332,78" fill="none" stroke="#3b82f6" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />
                  
                  {/* Arrow 2: Blue Badge -> Tablet Map */}
                  <path d="M 445,78 Q 490,95 440,195" fill="none" stroke="#3b82f6" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />
                  
                  {/* Arrow 3: Truck -> Navy Badge */}
                  <path d="M 145,340 Q 120,335 152,310" fill="none" stroke="var(--navy)" strokeWidth="2.5" markerEnd="url(#arrow-navy)" />
                  
                  {/* Arrow 4: Navy Badge -> Citizen Photo */}
                  <path d="M 103,290 Q 90,240 85,195" fill="none" stroke="var(--navy)" strokeWidth="2.5" markerEnd="url(#arrow-navy)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA FOOTER SECTION ─── */}
      <section style={{ background: 'var(--bg-dark)', padding: '6rem 0', color: 'white', textAlign: 'center', position: 'relative' }}>
        <div className="container-lg" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2.5rem', color: 'white', fontWeight: 900, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Ready to modernize waste collection?
          </h2>
          <p style={{ color: 'var(--text-on-dark-muted)', fontSize: '1.1rem', maxWidth: '520px', margin: '0 auto 2.5rem', lineHeight: 1.65 }}>
            Simplify scheduling, dispatch optimized routes to drivers, and connect with real-time citizen feedback.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/login', { state: { isLogin: false } })} className="btn btn-primary btn-lg" style={{ background: 'var(--primary)', padding: '0.85rem 2rem' }}>
              Get Started
            </button>
            <button onClick={() => navigate('/citizen')} className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.85rem 2rem' }}>
              Access Portal
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container-lg" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <WasteGridLogo size={16} color="var(--primary)" />
            <span style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>WasteGrid</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-on-dark-muted)' }}>
            © {new Date().getFullYear()} WasteGrid Smart Waste Management Portal. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
