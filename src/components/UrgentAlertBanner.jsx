import React from 'react';
import { AlertOctagon, AlertTriangle, Stethoscope, ChevronRight, Info } from 'lucide-react';

export default function UrgentAlertBanner({ alert }) {
  if (!alert || !alert.has_urgent_findings || !alert.alert_items || alert.alert_items.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF1F2 100%)',
      border: '2px solid #FECACA',
      borderRadius: 'var(--radius-md)',
      padding: '20px 24px',
      marginBottom: '24px',
      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: '#FEE2E2',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <AlertOctagon size={24} />
        </div>
        <div>
          <h3 style={{ color: '#991B1B', fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
            {alert.title || 'Urgent Medical Attention Recommended'}
          </h3>
          <p style={{ color: '#7F1D1D', fontSize: '0.875rem', margin: '2px 0 0 0' }}>
            {alert.summary}
          </p>
        </div>
      </div>

      {/* Triggered Items Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '12px',
        margin: '16px 0'
      }}>
        {alert.alert_items.map((item, idx) => (
          <div key={idx} style={{
            background: '#FFFFFF',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius)',
            padding: '14px 16px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <strong style={{ fontSize: '0.9375rem', color: '#1E293B' }}>{item.test_name}</strong>
              <span style={{
                background: '#FEE2E2',
                color: '#DC2626',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                {item.observed_value}
              </span>
            </div>

            {item.reference_interval && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Standard Target: {item.reference_interval}
              </div>
            )}

            <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
              {item.reason}
            </p>
          </div>
        ))}
      </div>

      {/* Clinical Guidance Footer */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #FED7AA',
        borderRadius: 'var(--radius)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Stethoscope size={20} color="#EA580C" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.8125rem', color: '#7C2D12' }}>
          <strong>Next Steps: </strong>
          {alert.recommendation}
        </div>
      </div>
    </div>
  );
}
