import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import { 
  FileText, 
  Search, 
  Trash2, 
  Eye, 
  Upload, 
  Calendar, 
  RotateCcw,
  Loader2,
  AlertCircle,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ReportsPage({ onOpenUpload }) {
  const { activePatient } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const navigate = useNavigate();

  useEffect(() => {
    if (activePatient?.id) {
      loadReports();
    }
  }, [activePatient?.id, filterType]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await reportsAPI.list(activePatient.id, filterType === 'all' ? null : filterType);
      setReports(res.data.reports || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, reportId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this report? This will permanently delete the PDF, all extracted observations, and vector embeddings.')) {
      return;
    }

    try {
      await reportsAPI.delete(reportId, activePatient.id);
      toast.success('Report and associated vectors deleted successfully');
      loadReports();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete report');
    }
  };

  const handleRetry = async (e, reportId) => {
    e.stopPropagation();
    try {
      toast.loading('Retrying report processing...', { id: 'retry' });
      await reportsAPI.retry(reportId, activePatient.id);
      toast.success('Re-processing started!', { id: 'retry' });
      loadReports();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to retry processing', { id: 'retry' });
    }
  };

  const filtered = reports.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      (r.original_filename && r.original_filename.toLowerCase().includes(term)) ||
      (r.report_type && r.report_type.toLowerCase().includes(term)) ||
      (r.laboratory && r.laboratory.toLowerCase().includes(term))
    );
  });

  const categories = [
    { id: 'all', label: 'All Reports' },
    { id: 'blood_test', label: 'Blood Tests' },
    { id: 'lipid_profile', label: 'Lipid Screen' },
    { id: 'liver_function', label: 'LFT / Liver' },
    { id: 'thyroid', label: 'Thyroid' },
    { id: 'urine_test', label: 'Urine Test' },
    { id: 'ultrasound', label: 'Ultrasound' },
    { id: 'xray', label: 'X-Ray' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Medical Reports Library</h1>
          <p>
            Records for <strong style={{ color: 'var(--primary)' }}>{activePatient?.name}</strong>
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenUpload}>
          <Upload size={16} /> Upload New Report
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {/* Category Tabs */}
        <div className="tabs" style={{ marginBottom: 0, overflowX: 'auto' }}>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`tab ${filterType === c.id ? 'active' : ''}`}
              onClick={() => setFilterType(c.id)}
              style={{ whiteSpace: 'nowrap' }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search & View Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by report name, laboratory, investigation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2px' }}>
            <button 
              className="tab" 
              style={{ padding: '6px 10px', background: viewMode === 'grid' ? 'var(--bg-hover)' : 'none' }}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              className="tab" 
              style={{ padding: '6px 10px', background: viewMode === 'list' ? 'var(--bg-hover)' : 'none' }}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Reports Content */}
      {loading ? (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <FileText size={64} />
          <h3>No reports found</h3>
          <p>
            {searchTerm 
              ? 'No medical reports matched your search criteria.' 
              : 'Start building your longitudinal health history by uploading your first PDF report.'}
          </p>
          <button className="btn btn-primary" onClick={onOpenUpload}>
            <Upload size={16} /> Upload Report
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid-3">
          {filtered.map((report) => (
            <div 
              key={report.id} 
              className="report-card"
              onClick={() => navigate(`/reports/${report.id}`)}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div className="report-card-type">
                  <div className="report-card-type-icon">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3>{report.report_type ? report.report_type.replace('_', ' ').toUpperCase() : 'Medical Report'}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {report.laboratory || 'Clinical Diagnostic Lab'}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={(e) => handleDelete(e, report.id)}
                  title="Delete report and purge vectors"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Calendar size={14} color="var(--text-muted)" />
                  <span>Clinical Date: <strong>{report.report_date || report.upload_timestamp?.split('T')[0]}</strong></span>
                </div>
                {report.total_pages && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {report.total_pages} page document • {report.original_filename}
                  </div>
                )}
                {report.status === 'failed' && report.processing_message && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px 10px', 
                    background: 'var(--status-urgent-bg)', 
                    border: '1px solid var(--status-urgent-border)', 
                    borderRadius: '6px', 
                    color: 'var(--status-urgent)', 
                    fontSize: '0.75rem',
                    lineHeight: 1.3
                  }}>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <AlertCircle size={13} /> Processing Incomplete:
                    </strong>
                    {report.processing_message}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                {report.status === 'failed' ? (
                  <>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => handleRetry(e, report.id)}
                      title="Retry processing this report"
                      style={{ gap: '4px' }}
                    >
                      <RotateCcw size={13} /> Retry
                    </button>
                    <span className="status-badge critical" style={{ fontSize: '0.7rem' }}>
                      FAILED
                    </span>
                  </>
                ) : report.status === 'processing' || report.status === 'extracting' || report.status === 'validating' ? (
                  <>
                    <span className="status-badge warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Loader2 size={12} className="spinner" /> Processing...
                    </span>
                    <span className="btn btn-secondary btn-sm">
                      Details →
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)' }}>
                      {report.observation_count} Tests Extracted
                    </span>
                    <span className="btn btn-secondary btn-sm">
                      View Report →
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Report Title</th>
                <th>Diagnostic Center</th>
                <th>Clinical Date</th>
                <th>Observations</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => (
                <tr 
                  key={report.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/reports/${report.id}`)}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} color="var(--primary)" />
                      <div>
                        <strong>{report.report_type ? report.report_type.replace('_', ' ').toUpperCase() : 'Medical Report'}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{report.original_filename}</div>
                      </div>
                    </div>
                  </td>
                  <td>{report.laboratory || '—'}</td>
                  <td>{report.report_date || report.upload_timestamp?.split('T')[0]}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{report.observation_count}</span> investigations
                  </td>
                  <td>
                    <span className={`status-badge ${report.status === 'failed' ? 'critical' : report.status === 'completed' ? 'normal' : 'warning'}`}>
                      {report.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {report.status === 'failed' ? (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => handleRetry(e, report.id)}
                          title="Retry processing"
                        >
                          <RotateCcw size={14} /> Retry
                        </button>
                      ) : (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => { e.stopPropagation(); navigate(`/reports/${report.id}`); }}
                        >
                          <Eye size={14} /> Open
                        </button>
                      )}
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={(e) => handleDelete(e, report.id)}
                        title="Delete report"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
