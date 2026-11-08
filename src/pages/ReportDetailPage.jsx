import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportsAPI, guidanceAPI } from '../services/api';
import TestResultTable from '../components/TestResultTable';
import StatusBadge from '../components/StatusBadge';
import UrgentAlertBanner from '../components/UrgentAlertBanner';
import HealthGuidanceCard from '../components/HealthGuidanceCard';
import { 
  FileText, 
  Calendar, 
  Building2, 
  User, 
  MessageSquare, 
  ExternalLink, 
  ArrowLeft, 
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportDetailPage() {
  const { id } = useParams();
  const { activePatient } = useAuth();
  const [report, setReport] = useState(null);
  const [observations, setObservations] = useState([]);
  const [guidance, setGuidance] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id && activePatient?.id) {
      loadReportDetails();
      setShowGuidance(false);
    }
  }, [id, activePatient?.id]);

  const loadReportDetails = async () => {
    try {
      setLoading(true);
      const [reportRes, obsRes, guidRes] = await Promise.allSettled([
        reportsAPI.get(id, activePatient.id),
        reportsAPI.getObservations(id, activePatient.id),
        guidanceAPI.getForReport(id, activePatient.id)
      ]);

      if (reportRes.status === 'fulfilled') setReport(reportRes.value.data);
      if (obsRes.status === 'fulfilled') setObservations(obsRes.value.data.observations || []);
      if (guidRes.status === 'fulfilled') setGuidance(guidRes.value.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this report and all its extracted observations and AI embeddings permanently?')) {
      return;
    }

    try {
      await reportsAPI.delete(id, activePatient.id);
      toast.success('Report deleted');
      navigate('/reports');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete report');
    }
  };

  const handleTestClick = (canonicalTestName) => {
    navigate(`/trends?test=${encodeURIComponent(canonicalTestName)}`);
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading report observations and verification data...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="empty-state card">
        <FileText size={48} />
        <h3>Report Not Found</h3>
        <p>The requested report does not exist or has been removed.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/reports')}>
          Back to Reports
        </button>
      </div>
    );
  }

  const normalCount = observations.filter(o => o.status === 'normal' || o.status === 'within_range').length;
  const attentionCount = observations.filter(o => o.status === 'attention').length;
  const significantCount = observations.filter(o => o.status === 'significant' || o.status === 'potentially_urgent').length;

  return (
    <div>
      {/* Back & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/reports')}
        >
          <ArrowLeft size={14} /> Back to Reports
        </button>
      </div>

      {/* Main Report Header Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
                  {report.report_type ? report.report_type.replace('_', ' ').toUpperCase() : 'Medical Report'}
                </h1>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  File: {report.original_filename}
                </div>
              </div>
            </div>

            {/* Metadata Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} color="var(--primary)" />
                <span>Clinical Date: <strong>{report.report_date || 'Not specified'}</strong></span>
              </div>
              {report.collection_date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} color="var(--text-muted)" />
                  <span>Collected: {report.collection_date} {report.collection_time || ''}</span>
                </div>
              )}
              {report.laboratory && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={15} color="var(--text-muted)" />
                  <span>Lab: {report.laboratory}</span>
                </div>
              )}
              {report.patient_name_on_report && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} color="var(--text-muted)" />
                  <span>Patient on Doc: {report.patient_name_on_report} ({report.age_on_report || '—'}, {report.gender_on_report || '—'})</span>
                </div>
              )}
            </div>
          </div>

          {/* Header Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowGuidance(!showGuidance)}
              style={{
                borderColor: showGuidance ? 'var(--primary)' : 'var(--border)',
                background: showGuidance ? 'var(--primary-bg)' : 'var(--bg-white)',
                color: showGuidance ? 'var(--primary)' : 'var(--text-primary)'
              }}
            >
              <Sparkles size={16} color="var(--tertiary)" /> 
              {showGuidance ? 'Hide Health Guidance' : 'View AI Guidance & Do\'s / Don\'ts'}
            </button>

            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/chat?reportId=${report.id}`)}
            >
              <MessageSquare size={16} /> Ask AI About Report
            </button>

            <button 
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              title="Delete report"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="metric-cards" style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-icon primary"><FileText size={22} /></div>
          <div>
            <div className="metric-value">{observations.length}</div>
            <div className="metric-label">Total Investigations</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon primary" style={{ background: 'var(--status-normal-bg)', color: 'var(--status-normal)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="metric-value">{normalCount}</div>
            <div className="metric-label">Within Reference Target</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon attention">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="metric-value">{attentionCount}</div>
            <div className="metric-label">Borderline / Attention</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'var(--status-significant-bg)', color: 'var(--status-significant)' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div className="metric-value">{significantCount}</div>
            <div className="metric-label">Significant Deviation</div>
          </div>
        </div>
      </div>

      {/* Urgent Medical Evaluation Alert (If serious findings detected) */}
      {guidance?.urgent_alert && (
        <UrgentAlertBanner alert={guidance.urgent_alert} />
      )}

      {/* Report-Based Health Guidance & Practical Do's & Don'ts (Click-to-view) */}
      {showGuidance && guidance && (
        <HealthGuidanceCard 
          guidance={guidance} 
          onClose={() => setShowGuidance(false)}
        />
      )}

      {/* Summary Text Card */}
      {report.summary && (
        <div className="card" style={{ marginBottom: '24px', background: 'var(--primary-bg)', border: '1px solid var(--primary-lighter)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--primary)' }}>
            <Sparkles size={18} />
            <strong style={{ fontSize: '0.875rem' }}>Report Summary & Observations</strong>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {report.summary}
          </p>
        </div>
      )}

      {/* Test Observations Table */}
      <div style={{ marginBottom: '24px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Extracted Laboratory Investigations</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Click any investigation row to view its historical longitudinal trend
            </p>
          </div>
        </div>

        <TestResultTable 
          observations={observations} 
          onSelectTest={handleTestClick}
        />
      </div>

      <div className="disclaimer">
        * Every observation is mapped with page references to the original diagnostic document. Always consult your qualified healthcare practitioner regarding reference interval interpretations.
      </div>
    </div>
  );
}
