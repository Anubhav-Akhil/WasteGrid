import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Bell, ChevronDown } from 'lucide-react';
import WasteGridLogo from './WasteGridLogo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { reports } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingReports = reports?.filter(r => r.status === 'Pending').length || 0;
  const notifications = reports?.filter(r => r.status === 'Pending' || r.status === 'Dispatched').slice(0, 5) || [];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login', { state: { isLogin: true } });
  };

  const navLinks = user
    ? user.role === 'admin'
      ? [{ path: '/admin', label: 'Dashboard' }, { path: '/citizen', label: 'Citizen View' }]
      : user.role === 'driver'
        ? [{ path: '/driver', label: 'Console' }, { path: '/citizen', label: 'Citizen View' }]
        : [{ path: '/citizen', label: 'Report Portal' }]
    : [{ path: '/login', label: 'Login/Register' }];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 4000,
      background: 'white',
      borderBottom: '1px solid var(--border-color)',
      height: '60px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'visible',
    }}>
      <div style={{ width: '100%', maxWidth: 1400, padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 4001 }}>

        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
        >
          <WasteGridLogo size={24} color="var(--primary)" />
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>
            WasteGrid
          </span>
        </div>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button onClick={() => navigate('/')} className="btn btn-ghost btn-sm" style={{ color: isActive('/') ? 'var(--primary)' : 'var(--text-secondary)' }}>
            Home
          </button>
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="btn btn-ghost btn-sm"
              style={{ color: isActive(link.path) ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: isActive(link.path) ? 700 : 500 }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {user ? (
            <>
              {/* Bell for admins */}
              {user.role === 'admin' && (
                <div style={{ position: 'relative' }}>
                  <button
                    className="btn btn-ghost btn-icon"
                    title="Notifications"
                    onClick={() => setShowNotifications(v => !v)}
                  >
                    <Bell size={18} color="var(--text-secondary)" />
                  </button>
                  {pendingReports > 0 && (
                    <span style={{
                      position: 'absolute', top: 0, right: 0,
                      background: 'var(--danger)', color: 'white',
                      fontSize: '9px', fontWeight: 800,
                      width: 15, height: 15, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid white',
                    }}>
                      {pendingReports > 9 ? '9+' : pendingReports}
                    </span>
                  )}

                  {showNotifications && (
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
                      width: '320px', maxHeight: '360px', overflowY: 'auto',
                      background: 'white', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 5000,
                      isolation: 'isolate',
                    }}>
                      <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--navy)', fontSize: '0.9rem' }}>Notifications</strong>
                        <button className="btn btn-ghost btn-xs" onClick={() => setShowNotifications(false)}>Close</button>
                      </div>
                      {notifications.length > 0 ? notifications.map((item) => (
                        <div key={item._id} style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.status === 'Pending' ? 'var(--danger)' : 'var(--warning)', marginTop: '0.35rem', flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {item.locationName || 'Waste alert'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                              {item.description || 'A new waste report needs attention.'}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                              {item.status}
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          No new notifications.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* User chip */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.3rem 0.7rem 0.3rem 0.3rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 700,
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
                <span className={`badge ${user.role === 'admin' ? 'badge-success' : user.role === 'driver' ? 'badge-info' : 'badge-muted'}`} style={{ fontSize: '0.62rem' }}>
                  {user.role}
                </span>
              </div>

              <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>
                <LogOut size={15} /> Sign Out
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
