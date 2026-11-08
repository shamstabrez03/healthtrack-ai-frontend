import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Settings as SettingsIcon, 
  PlusCircle, 
  ChevronDown, 
  Check, 
  LogOut, 
  Activity,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ onOpenUpload }) {
  const { user, patients, activePatient, switchPatient, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>
          <Activity size={26} color="var(--primary)" /> HealthTrack AI
        </h1>
        <span>Report Intelligence & Tracking</span>
      </div>

      {/* Profile Switcher */}
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <div 
          className="profile-switcher" 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          title="Switch active patient profile"
        >
          <div>
            <div className="profile-label">ACTIVE PROFILE</div>
            <div className="profile-name">
              {activePatient?.name || user?.name || 'My Health'}
            </div>
          </div>
          <ChevronDown size={16} color="var(--primary)" />
        </div>

        {dropdownOpen && (
          <div className="profile-dropdown">
            <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              FAMILY PROFILES
            </div>
            {patients.map((p) => (
              <button
                key={p.id}
                className={`profile-dropdown-item ${activePatient?.id === p.id ? 'active' : ''}`}
                onClick={() => {
                  switchPatient(p);
                  setDropdownOpen(false);
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: activePatient?.id === p.id ? 600 : 400 }}>{p.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {p.relationship_type.toUpperCase()} • {p.report_count || 0} reports
                  </div>
                </div>
                {activePatient?.id === p.id && <Check size={16} color="var(--primary)" />}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--border-light)', padding: '4px' }}>
              <button
                className="profile-dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/family');
                }}
                style={{ color: 'var(--primary)', fontWeight: 600 }}
              >
                <PlusCircle size={16} /> Manage Family Profiles
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Action */}
      <div style={{ padding: '0 16px', margin: '8px 0 16px 0' }}>
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={onOpenUpload}
        >
          <Upload size={16} /> Upload Report
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>

        <NavLink 
          to="/reports" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <FileText size={20} /> Reports
        </NavLink>

        <NavLink 
          to="/trends" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <TrendingUp size={20} /> Health Trends
        </NavLink>

        <NavLink 
          to="/chat" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <MessageSquare size={20} /> AI Medical Chat
        </NavLink>

        <NavLink 
          to="/family" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Users size={20} /> Family
        </NavLink>

        <NavLink 
          to="/settings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <SettingsIcon size={20} /> Settings
        </NavLink>
      </nav>

      {/* User Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.email}
          </div>
        </div>
        <button 
          onClick={logout}
          title="Sign out"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
