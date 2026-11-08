import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { trendsAPI } from '../services/api';
import TrendChart from '../components/TrendChart';
import StatusBadge from '../components/StatusBadge';
import { 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  Activity, 
  Search,
  Filter,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TrendsPage() {
  const { activePatient } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [period, setPeriod] = useState('1y'); // 3m, 6m, 1y, 3y, all
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testSearch, setTestSearch] = useState('');

  // Read ?test= query param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const testParam = params.get('test');
    if (testParam) {
      setSelectedTest(testParam);
    }
  }, [location.search]);

  // Load available tests when patient changes
  useEffect(() => {
    if (activePatient?.id) {
      loadAvailableTests();
    }
  }, [activePatient?.id]);

  // Load trend data when selected test or period changes
  useEffect(() => {
    if (activePatient?.id && selectedTest) {
      loadTrendData(selectedTest, period);
    }
  }, [activePatient?.id, selectedTest, period]);

  const loadAvailableTests = async () => {
    try {
      setLoading(true);
      const res = await trendsAPI.getAvailableTests(activePatient.id);
      const tests = res.data.tests || [];
      setAvailableTests(tests);

      if (!selectedTest && tests.length > 0) {
        setSelectedTest(tests[0].canonical_name);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load available investigations');
    } finally {
      setLoading(false);
    }
  };

  const loadTrendData = async (testName, timePeriod) => {
    try {
      setLoading(true);
      const res = await trendsAPI.getTrend(testName, activePatient.id, timePeriod);
      setTrendData(res.data);
    } catch (err) {
      console.error(err);
      setTrendData(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = availableTests.filter(t => 
    t.canonical_name.toLowerCase().includes(testSearch.toLowerCase()) ||
    (t.display_name && t.display_name.toLowerCase().includes(testSearch.toLowerCase()))
  );

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1>Longitudinal Health Trends</h1>
        <p>
          Historical progression and reference tracking for <strong style={{ color: 'var(--primary)' }}>{activePatient?.name}</strong>
        </p>
      </div>

      {availableTests.length === 0 && !loading ? (
        <div className="empty-state card">
          <Activity size={48} />
          <h3>No Trend Data Available Yet</h3>
          <p>
            Upload laboratory reports to start tracking biological test results and cholesterol levels over time.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
          {/* Left Column: Test Selector Sidebar */}
          <div>
            <div className="card" style={{ padding: '16px', position: 'sticky', top: '24px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '12px' }}>
                TRACKED INVESTIGATIONS
              </div>

              {/* Search tests */}
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Filter test names..."
                  value={testSearch}
                  onChange={(e) => setTestSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '28px', fontSize: '0.75rem', padding: '6px 8px 6px 28px' }}
                />
              </div>

              {/* Test list */}
              <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {filteredTests.map((t) => (
                  <button
                    key={t.canonical_name}
                    className={`nav-item ${selectedTest === t.canonical_name ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedTest(t.canonical_name);
                      navigate(`/trends?test=${encodeURIComponent(t.canonical_name)}`);
                    }}
                    style={{ fontSize: '0.8125rem', padding: '8px 10px', justifyContent: 'space-between' }}
                  >
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {t.canonical_name}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: '10px' }}>
                      {t.data_point_count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Chart & Stats */}
          <div>
            {/* Period Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
                  {trendData?.test_name || selectedTest}
                </h2>
                {trendData?.unit && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Unit of Measurement: {trendData.unit}
                  </span>
                )}
              </div>

              {/* Time Period Tabs */}
              <div className="tabs" style={{ marginBottom: 0 }}>
                {['3m', '6m', '1y', '3y', 'all'].map((p) => (
                  <button
                    key={p}
                    className={`tab ${period === p ? 'active' : ''}`}
                    onClick={() => setPeriod(p)}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Interactive Chart Card */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  HISTORICAL TRAJECTORY
                </span>
                {trendData?.reference_text && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', background: 'var(--primary-bg)', padding: '4px 10px', borderRadius: '20px' }}>
                    Reference Target: {trendData.reference_text} {trendData.unit}
                  </span>
                )}
              </div>

              <TrendChart 
                data={trendData?.data_points || []} 
                refLow={trendData?.reference_low}
                refHigh={trendData?.reference_high}
                unit={trendData?.unit || ''}
                height={320}
              />
            </div>

            {/* Statistical KPI Row */}
            {trendData && (
              <div className="grid-4" style={{ marginBottom: '24px' }}>
                <div className="card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FIRST RECORDED</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0' }}>
                    {trendData.first_value ?? '—'} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>{trendData.unit}</span>
                  </div>
                </div>

                <div className="card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LATEST VALUE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0', color: 'var(--primary)' }}>
                    {trendData.latest_value ?? '—'} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>{trendData.unit}</span>
                  </div>
                </div>

                <div className="card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DELTA CHANGE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {trendData.absolute_change !== null ? (
                      <>
                        {trendData.direction === 'increasing' && <ArrowUpRight size={18} color="var(--trend-down)" />}
                        {trendData.direction === 'decreasing' && <ArrowDownRight size={18} color="var(--trend-up)" />}
                        {trendData.direction === 'stable' && <Minus size={18} color="var(--trend-stable)" />}
                        <span>{trendData.absolute_change > 0 ? `+${trendData.absolute_change}` : trendData.absolute_change}</span>
                        {trendData.percentage_change !== null && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                            ({trendData.percentage_change > 0 ? `+${trendData.percentage_change}` : trendData.percentage_change}%)
                          </span>
                        )}
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>

                <div className="card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MIN / MAX / AVG</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, margin: '6px 0' }}>
                    {trendData.min_value} / {trendData.max_value} / {trendData.avg_value}
                  </div>
                </div>
              </div>
            )}

            {/* Historical Values Table */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.9375rem', marginBottom: '16px' }}>Chronological Checkpoint Records</h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Checkup Date</th>
                      <th>Observed Value</th>
                      <th>Reference Target</th>
                      <th>Status Evaluation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(trendData?.data_points || []).map((dp, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} color="var(--text-muted)" />
                            <strong>{dp.date}</strong>
                          </div>
                        </td>
                        <td className="value-cell">
                          {dp.value} {dp.unit || trendData.unit}
                        </td>
                        <td>
                          {trendData.reference_text || (trendData.reference_low !== null && trendData.reference_high !== null ? `${trendData.reference_low} - ${trendData.reference_high}` : '—')}
                        </td>
                        <td>
                          <StatusBadge status={dp.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
