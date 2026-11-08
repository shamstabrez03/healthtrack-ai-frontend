import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Utensils, 
  Activity, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  Heart,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';

export default function HealthGuidanceCard({ guidance, onClose }) {
  const [activeTab, setActiveTab] = useState('dos_donts'); // 'dos_donts', 'diet', 'lifestyle', 'questions'

  if (!guidance) return null;

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '24px', border: '1.5px solid var(--primary-lighter)', boxShadow: '0 4px 20px rgba(15, 118, 110, 0.08)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--tertiary-bg)',
            color: 'var(--tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.125rem', margin: 0, fontWeight: 700 }}>
                AI Health Guidance & Practical Do's & Don'ts
              </h2>
              {guidance.report_type && (
                <span style={{
                  background: 'var(--primary-bg)',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {guidance.report_type.replace('_', ' ').toUpperCase()} {guidance.report_date ? `(${guidance.report_date})` : ''}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Tailored health & lifestyle suggestions derived strictly from this report's findings
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Category Tabs */}
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button
              className={`tab ${activeTab === 'dos_donts' ? 'active' : ''}`}
              onClick={() => setActiveTab('dos_donts')}
            >
              Do's & Don'ts
            </button>
            <button
              className={`tab ${activeTab === 'diet' ? 'active' : ''}`}
              onClick={() => setActiveTab('diet')}
            >
              Diet & Nutrition
            </button>
            <button
              className={`tab ${activeTab === 'lifestyle' ? 'active' : ''}`}
              onClick={() => setActiveTab('lifestyle')}
            >
              Activity & Habits
            </button>
            <button
              className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              Doctor Questions
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              title="Close guidance panel"
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              ✕ Hide
            </button>
          )}
        </div>
      </div>

      {/* General Summary Box */}
      {guidance.general_summary && (
        <div style={{
          background: 'var(--primary-bg)',
          border: '1px solid var(--primary-lighter)',
          borderRadius: 'var(--radius)',
          padding: '12px 16px',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '20px'
        }}>
          {guidance.general_summary}
        </div>
      )}

      {/* Tab 1: Practical Do's & Don'ts */}
      {activeTab === 'dos_donts' && (
        <div className="grid-2" style={{ gap: '20px' }}>
          {/* Do's Column */}
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: 'var(--radius-md)',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#166534' }}>
              <CheckCircle2 size={20} color="#16A34A" />
              <strong style={{ fontSize: '1rem' }}>Practical Do's</strong>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {guidance.dos && guidance.dos.map((item, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '0.875rem',
                  color: '#1E293B',
                  marginBottom: '10px',
                  lineHeight: 1.5
                }}>
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts Column */}
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#991B1B' }}>
              <XCircle size={20} color="#DC2626" />
              <strong style={{ fontSize: '1rem' }}>Practical Don'ts</strong>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {guidance.donts && guidance.donts.map((item, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '0.875rem',
                  color: '#1E293B',
                  marginBottom: '10px',
                  lineHeight: 1.5
                }}>
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Diet & Nutrition Suggestions */}
      {activeTab === 'diet' && (
        <div style={{
          background: 'var(--bg-white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--primary)' }}>
            <Utensils size={20} />
            <strong style={{ fontSize: '1rem' }}>Nutritional & Dietary Recommendations</strong>
          </div>
          <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>
            {guidance.diet_suggestions && guidance.diet_suggestions.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tab 3: Physical Activity & Lifestyle */}
      {activeTab === 'lifestyle' && (
        <div style={{
          background: 'var(--bg-white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--secondary)' }}>
            <Activity size={20} />
            <strong style={{ fontSize: '1rem' }}>Physical Activity & Lifestyle Habits</strong>
          </div>
          <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>
            {guidance.lifestyle_suggestions && guidance.lifestyle_suggestions.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tab 4: Doctor Discussion Questions */}
      {activeTab === 'questions' && (
        <div style={{
          background: 'var(--bg-white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--tertiary)' }}>
            <MessageSquare size={20} />
            <strong style={{ fontSize: '1rem' }}>Questions to Ask Your Doctor</strong>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Bring these targeted questions to your next clinical consultation:
          </p>
          <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>
            {guidance.doctor_questions && guidance.doctor_questions.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '8px' }}>
                <strong>"{item}"</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Educational Disclaimer & Bottom Collapse Button */}
      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="disclaimer" style={{ background: 'var(--bg-page)', padding: '10px 14px', margin: 0 }}>
          <ShieldCheck size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: 'var(--text-muted)' }} />
          {guidance.disclaimer || 'Educational guidance only. Does not replace professional medical evaluation or clinical advice.'}
        </div>

        {onClose && (
          <div style={{ textAlign: 'center', marginTop: '4px' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{
                padding: '8px 24px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                borderColor: 'var(--border)',
                background: 'var(--bg-hover)'
              }}
            >
              <ChevronUp size={16} /> Collapse & Hide Health Guidance
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
