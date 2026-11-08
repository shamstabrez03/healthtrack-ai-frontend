import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine
} from 'recharts';

export default function TrendChart({ 
  data = [], 
  refLow = null, 
  refHigh = null, 
  unit = '', 
  height = 280,
  isMini = false
}) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        No historical data points yet
      </div>
    );
  }

  // Format data for Recharts
  const formattedData = data.map(item => ({
    date: item.date,
    value: item.value,
    status: item.status,
    unit: item.unit || unit
  }));

  const values = formattedData.map(d => d.value);
  const minVal = Math.min(...values, refLow ?? Infinity);
  const maxVal = Math.max(...values, refHigh ?? -Infinity);
  const padding = (maxVal - minVal) * 0.2 || 10;
  const domainMin = Math.max(0, Math.floor(minVal - padding));
  const domainMax = Math.ceil(maxVal + padding);

  if (isMini) {
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: 'var(--primary)' }}
              activeDot={{ r: 5 }}
            />
            {refHigh !== null && (
              <ReferenceLine y={refHigh} stroke="var(--status-attention)" strokeDasharray="3 3" />
            )}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={{ background: 'var(--bg-white)', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.75rem', boxShadow: 'var(--shadow)' }}>
                      <strong>{payload[0].value} {unit}</strong>
                      <div style={{ color: 'var(--text-muted)' }}>{payload[0].payload.date}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
          
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
          />
          
          <YAxis 
            domain={[domainMin, domainMax]} 
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            unit={unit ? ` ${unit}` : ''}
          />

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div style={{ background: 'var(--bg-white)', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.date}</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                      {item.value} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>{item.unit}</span>
                    </div>
                    {refLow !== null && refHigh !== null && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Ref Range: {refLow} - {refHigh} {item.unit}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Shaded Reference Range Area */}
          {refLow !== null && refHigh !== null && (
            <ReferenceArea 
              y1={refLow} 
              y2={refHigh} 
              fill="var(--status-normal-bg)" 
              fillOpacity={0.6}
            />
          )}

          {refHigh !== null && refLow === null && (
            <ReferenceLine y={refHigh} stroke="var(--status-attention)" strokeDasharray="4 4" label={{ value: `Max: ${refHigh}`, fill: 'var(--status-attention)', fontSize: 11 }} />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={{ r: 5, fill: 'var(--bg-white)', stroke: 'var(--primary)', strokeWidth: 2.5 }}
            activeDot={{ r: 7, fill: 'var(--primary)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
