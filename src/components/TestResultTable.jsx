import React, { useState } from 'react';
import { Search, ArrowUpDown, Info, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function TestResultTable({ observations = [], onSelectTest }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activePanel, setActivePanel] = useState('All');
  const [sortField, setSortField] = useState('test_name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Extract unique panels
  const panels = ['All', ...Array.from(new Set(observations.map(o => o.panel).filter(Boolean)))];

  // Filtering
  const filtered = observations.filter(obs => {
    const matchesSearch = 
      (obs.test_name && obs.test_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (obs.canonical_test_name && obs.canonical_test_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (obs.panel && obs.panel.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPanel = activePanel === 'All' || obs.panel === activePanel;
    return matchesSearch && matchesPanel;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField] ?? '';
    let valB = b[sortField] ?? '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div>
      {/* Search and Panel Filter Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        {/* Panel Tabs */}
        <div className="tabs" style={{ marginBottom: 0, overflowX: 'auto', maxWidth: '70%' }}>
          {panels.map(panel => (
            <button
              key={panel}
              className={`tab ${activePanel === panel ? 'active' : ''}`}
              onClick={() => setActivePanel(panel)}
              style={{ whiteSpace: 'nowrap' }}
            >
              {panel}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search investigations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', paddingRight: '12px', fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto', background: 'var(--bg-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('test_name')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Investigation / Test <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Category</th>
              <th onClick={() => toggleSort('value_numeric')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Observed Result <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Unit</th>
              <th>Biological Reference Interval</th>
              <th>Status</th>
              <th>Source Trace</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No investigation results match the selected filter.
                </td>
              </tr>
            ) : (
              sorted.map((obs) => (
                <tr 
                  key={obs.id} 
                  style={{ cursor: onSelectTest ? 'pointer' : 'default' }}
                  onClick={() => onSelectTest && onSelectTest(obs.canonical_test_name || obs.test_name)}
                >
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {obs.test_name}
                    </div>
                    {obs.canonical_test_name && obs.canonical_test_name !== obs.test_name && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Normalized: {obs.canonical_test_name}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: '4px' }}>
                      {obs.panel || 'General'}
                    </span>
                  </td>
                  <td className="value-cell">
                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {obs.value_text || obs.value_numeric || '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {obs.unit || '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      {obs.reference_text || (obs.reference_low !== null && obs.reference_high !== null ? `${obs.reference_low} - ${obs.reference_high}` : '—')}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={obs.status} />
                  </td>
                  <td>
                    {obs.source_page && (
                      <span 
                        title={`Extracted from Page ${obs.source_page}`}
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'var(--primary-bg)', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        Pg {obs.source_page}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
