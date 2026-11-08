import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ComparisonView({ keyTrends = [] }) {
  if (!keyTrends || keyTrends.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        No historical comparison data yet. Upload 2 or more reports to see changes over time.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
      {keyTrends.map((trend) => {
        const isUp = trend.direction === 'increasing';
        const isDown = trend.direction === 'decreasing';
        const absChange = trend.absolute_change;
        const pctChange = trend.percentage_change;

        return (
          <div key={trend.canonical_test_name} className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{trend.test_name}</span>
              <StatusBadge status={trend.latest_status} />
            </div>

            {/* Values Progression */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '10px 0' }}>
              {trend.previous_value !== null && (
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {trend.previous_value}
                </span>
              )}
              {trend.previous_value !== null && <span style={{ color: 'var(--text-muted)' }}>→</span>}
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {trend.latest_value}
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{trend.unit}</span>
            </div>

            {/* Change Indicator */}
            {absChange !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                {isUp && <ArrowUpRight size={16} color="var(--trend-down)" />}
                {isDown && <ArrowDownRight size={16} color="var(--trend-up)" />}
                {!isUp && !isDown && <Minus size={16} color="var(--trend-stable)" />}

                <span style={{ 
                  fontWeight: 600, 
                  color: isDown ? 'var(--trend-up)' : isUp ? 'var(--trend-down)' : 'var(--trend-stable)' 
                }}>
                  {absChange > 0 ? `+${absChange}` : absChange} {trend.unit} ({pctChange > 0 ? `+${pctChange}` : pctChange}%)
                </span>
                <span style={{ color: 'var(--text-muted)' }}>vs previous</span>
              </div>
            )}

            {trend.reference_text && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Ref Target: {trend.reference_text}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
