import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, variant = 'primary', onClick }) {
  return (
    <div className="metric-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className={`metric-icon ${variant}`}>
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <div className="metric-value">{value}</div>
        <div className="metric-label">{title}</div>
        {subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</div>}
      </div>
    </div>
  );
}
