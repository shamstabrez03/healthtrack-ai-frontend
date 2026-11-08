import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, guidanceAPI } from '../services/api';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import ComparisonView from '../components/ComparisonView';
import TimelineView from '../components/TimelineView';
import UrgentAlertBanner from '../components/UrgentAlertBanner';
import HealthGuidanceCard from '../components/HealthGuidanceCard';
import { 
  FileText, 
  Activity, 
  Calendar, 
  AlertTriangle, 
  Upload, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  Stethoscope,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DashboardPage({ onOpenUpload }) {
  const { user, activePatient } = useAuth();
  const [data, setData] = useState(null);
  const [guidance, setGuidance] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const [loadingGuidance, setLoadingGuidance] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (activePatient?.id) {
      loadDashboard();
      setShowGuidance(false);
      setGuidance(null);
    }
  }, [activePatient?.id]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.get(activePatient.id);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGuidance = async () => {
    if (showGuidance) {
      setShowGuidance(false);
      return;
    }

    if (guidance) {
      setShowGuidance(true);
      return;
    }

    try {
      setLoadingGuidance(true);
      const res = await guidanceAPI.getLatest(activePatient.id);
      setGuidance(res.data);
      setShowGuidance(true);
    } catch (err) {
      console.error('Failed to load guidance', err);
      toast.error('Failed to generate health guidance');
    } finally {
      setLoadingGuidance(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading health overview for {activePatient?.name}...</p>
      </div>
    );
  }

  const reports = data?.latest_reports || [];
  const attentionItems = data?.attention_items || [];
  const keyTrends = data?.key_trends || [];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Good day, {user?.name?.split(' ')[0]}</h1>
          <p>
            Health Overview for <strong style={{ color: 'var(--primary)' }}>{activePatient?.name}</strong> ({activePatient?.relationship_type?.toUpperCase()})
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenUpload}>
          <Upload size={16} /> Upload Report
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="metric-cards">
        <MetricCard
          title="Total Reports"
          value={data?.report_count || 0}
          icon={FileText}
          variant="primary"
          onClick={() => navigate('/reports')}
        />
        <MetricCard
          title="Tracked Tests"
          value={data?.tracked_test_count || 0}
          icon={Activity}
          variant="secondary"
          onClick={() => navigate('/trends')}
        />
        <MetricCard
          title="Reports This Year"
          value={data?.reports_this_year || 0}
          icon={Calendar}
          variant="tertiary"
          onClick={() => navigate('/reports')}
        />
        <MetricCard
          title="Needs Attention"
          value={data?.attention_count || 0}
          subtitle="in latest report"
          icon={AlertTriangle}
          variant="attention"
        />
      </div>

      {/* Urgent Medical Evaluation Alert (If serious findings detected) */}
      {guidance?.urgent_alert && (
        <UrgentAlertBanner alert={guidance.urgent_alert} />
      )}

      {/* Attention Section (Observations from the CURRENT report needing attention) */}
      {attentionItems.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div className="attention-banner">
            <AlertTriangle size={22} />
            <div style={{ flex: 1 }}>
              <h4>{attentionItems.length} Result{attentionItems.length > 1 ? 's' : ''} in Latest Report Outside Standard Reference Range</h4>
              <p>
                The following values from your current report differ from standard laboratory target intervals.
                These are educational markers to discuss with your physician.
              </p>

              <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                {attentionItems.slice(0, 6).map((item) => (
                  <div 
                    key={item.id} 
                    style={{ background: 'var(--bg-white)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--status-attention-border)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.875rem' }}>{item.test_name}</strong>
                      <StatusBadge status={item.status} />
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, margin: '4px 0' }}>
                      {item.value_text || item.value_numeric} {item.unit}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Target: {item.reference_text || 'Standard reference'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* On-Demand AI Health Guidance & Practical Do's and Don'ts CTA */}
      {data?.report_count > 0 && (
        <div style={{ marginBottom: '24px' }}>
          {!showGuidance ? (
            <div className="card" style={{
              background: 'linear-gradient(135deg, #F0FDFA 0%, #FAF5FF 100%)',
              border: '1.5px solid var(--primary-lighter)',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  color: 'var(--tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  flexShrink: 0
                }}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    AI Report Health Guidance & Practical Do's / Don'ts
                  </strong>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Analyze findings from your latest report to view personalized diet, exercise, and lifestyle guidance
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleToggleGuidance}
                disabled={loadingGuidance}
              >
                {loadingGuidance ? (
                  <>
                    <Loader2 size={16} className="spinner" /> Analyzing Report...
                  </>
                ) : (
                  '✨ View AI Health Guidance & Do\'s / Don\'ts'
                )}
              </button>
            </div>
          ) : (
            <HealthGuidanceCard 
              guidance={guidance} 
              onClose={() => setShowGuidance(false)} 
            />
          )}
        </div>
      )}

      {/* Main Grid: Trends & Comparison */}
      <div style={{ marginBottom: '32px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Longitudinal Health Trends</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Deterministic delta calculations & test trajectories across checkups
            </p>
          </div>
          {keyTrends.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/trends')}>
              View Detailed Analytics <ChevronRight size={14} />
            </button>
          )}
        </div>

        <ComparisonView keyTrends={keyTrends} />
      </div>

      {/* 2-Column Section: Latest Reports & Medical Timeline */}
      <div className="grid-2" style={{ marginBottom: '32px' }}>
        {/* Latest Reports */}
        <div>
          <div className="section-header">
            <h2 className="section-title">Latest Medical Reports</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/reports')}>
              All Reports ({data?.report_count || 0})
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <FileText size={40} style={{ opacity: 0.4, margin: '0 auto 12px' }} />
              <p>No reports uploaded yet for this profile.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={onOpenUpload}>
                Upload First Report
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reports.map((report) => (
                <div 
                  key={report.id} 
                  className="report-card" 
                  onClick={() => navigate(`/reports/${report.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="report-card-type">
                      <div className="report-card-type-icon">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3>{report.report_type ? report.report_type.replace('_', ' ').toUpperCase() : 'Medical Report'}</h3>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {report.laboratory || 'Clinical Lab'}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-bg)', padding: '3px 8px', borderRadius: '4px' }}>
                      {report.report_date || report.upload_timestamp?.split('T')[0]}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <strong>{report.observation_count}</strong> observations extracted
                    </span>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '4px 10px' }}>
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div>
          <div className="section-header">
            <h2 className="section-title">Medical Timeline</h2>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <TimelineView reports={reports} />
          </div>
        </div>
      </div>

      {/* AI Assistant Callout */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-bg) 0%, var(--tertiary-bg) 100%)', border: '1px solid var(--primary-lighter)', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tertiary)', boxShadow: 'var(--shadow-sm)' }}>
            <Sparkles size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
              Have questions about your test results?
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Ask HealthTrack AI assistant about your reports, lipid levels, or longitudinal changes.
            </p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/chat')}>
          Open AI Medical Chat
        </button>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        * HealthTrack AI is designed for personal wellness and longitudinal monitoring. All insights, reference ranges, and AI responses are educational and do not constitute a medical diagnosis or treatment plan.
      </div>
    </div>
  );
}
