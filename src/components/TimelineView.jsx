import React from 'react';
import { FileText, ChevronRight, Activity, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TimelineView({ reports = [] }) {
  const navigate = useNavigate();

  if (!reports || reports.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No report timeline entries yet. Upload your first report to begin tracking!
      </div>
    );
  }

  return (
    <div className="timeline">
      {reports.map((report) => (
        <div key={report.id} className="timeline-item">
          <div className="timeline-date">
            <Calendar size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            {report.report_date || (report.upload_timestamp ? report.upload_timestamp.split('T')[0] : 'Unknown Date')}
          </div>
          <div 
            className="card" 
            style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => navigate(`/reports/${report.id}`)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {report.report_type ? report.report_type.replace('_', ' ').toUpperCase() : 'Medical Report'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {report.laboratory || 'Diagnostic Lab'} • {report.observation_count || 0} observations
                </div>
              </div>
            </div>

            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
        </div>
      ))}
    </div>
  );
}
