import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatAPI, reportsAPI } from '../services/api';
import { 
  Send, 
  Sparkles, 
  User, 
  FileText, 
  ExternalLink, 
  HelpCircle, 
  Loader2, 
  ShieldAlert,
  Bot,
  Calendar
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { activePatient } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState('history'); // 'history' or 'report'
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Check URL params for reportId
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reportIdParam = params.get('reportId');
    if (reportIdParam) {
      setMode('report');
      setSelectedReportId(reportIdParam);
    }
  }, [location.search]);

  // Load available reports for dropdown
  useEffect(() => {
    if (activePatient?.id) {
      loadReports();
    }
  }, [activePatient?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadReports = async () => {
    try {
      const res = await reportsAPI.list(activePatient.id);
      const list = res.data.reports || [];
      setReports(list);
      if (!selectedReportId && list.length > 0) {
        setSelectedReportId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const quickPrompts = mode === 'report' ? [
    "What are the abnormal findings in this report?",
    "Explain my cholesterol and lipid panel values",
    "What should I discuss with my doctor regarding this test?",
    "What lifestyle factors may help improve these results?"
  ] : [
    "What changed in my latest blood report compared to previous ones?",
    "How has my LDL cholesterol trended over time?",
    "Summarize all out-of-range observations across my medical history",
    "What lifestyle or dietary questions should I bring to my doctor?"
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading || !activePatient) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let res;
      if (mode === 'report' && selectedReportId) {
        res = await chatAPI.reportChat(query, activePatient.id, selectedReportId);
      } else {
        res = await chatAPI.historyChat(query, activePatient.id);
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.data.response,
        sources: res.data.sources || [],
        trendData: res.data.trend_data || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const errorDetail = err.response?.data?.detail || 'Failed to generate response. Please check your Gemini API key in Settings.';
      toast.error(errorDetail);

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `⚠️ **Error:** ${errorDetail}\n\n*Please ensure your Gemini API key is configured in Settings.*`,
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Top Controls Header */}
      <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={22} color="var(--tertiary)" /> AI Medical Assistant
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Grounded intelligence for <strong style={{ color: 'var(--primary)' }}>{activePatient?.name}</strong>
          </p>
        </div>

        {/* Scope Toggle & Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button 
              className={`tab ${mode === 'history' ? 'active' : ''}`}
              onClick={() => setMode('history')}
            >
              All Medical History
            </button>
            <button 
              className={`tab ${mode === 'report' ? 'active' : ''}`}
              onClick={() => setMode('report')}
            >
              Specific Report
            </button>
          </div>

          {mode === 'report' && (
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8125rem' }}
            >
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.report_type?.toUpperCase() || 'Report'} ({r.report_date || r.upload_timestamp?.split('T')[0]})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--tertiary-bg)', color: 'var(--tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Bot size={28} />
            </div>
            <h3>How can I assist with your medical records?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '480px', margin: '8px auto 24px' }}>
              {mode === 'report' 
                ? 'Ask specific questions about the selected diagnostic report, abnormal intervals, or lab values.'
                : 'Ask questions across all historical checkups, longitudinal test changes, or general educational insights.'}
            </p>

            {/* Quick Prompts */}
            <div className="quick-prompts" style={{ justifyContent: 'center', maxWidth: '700px', margin: '0 auto' }}>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  className="quick-prompt"
                  onClick={() => handleSend(prompt)}
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>

              <div className="message-content">
                {msg.sender === 'user' ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                ) : (
                  <>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                    
                    {/* Mandatory Disclaimer for Every AI Response */}
                    <div style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      background: 'rgba(15, 118, 110, 0.05)',
                      borderLeft: '3px solid var(--primary)',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45
                    }}>
                      <ShieldAlert size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom', color: 'var(--primary)' }} />
                      <strong>Disclaimer:</strong> AI-generated health insights are informational and not a substitute for professional medical advice. Please consult a healthcare professional for medical concerns.
                    </div>
                  </>
                )}

                {/* Sources Cards */}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                      SOURCE TRACEABILITY:
                    </div>
                    <div>
                      {msg.sources.map((src, i) => (
                        <span 
                          key={i} 
                          className="source-card"
                          onClick={() => src.report_id && navigate(`/reports/${src.report_id}`)}
                        >
                          <FileText size={12} color="var(--primary)" />
                          <span>{src.text || `${src.report_type || 'Report'} (${src.report_date || ''})`}</span>
                          {src.page_number && <strong>Pg {src.page_number}</strong>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="chat-message ai">
            <div className="message-avatar">
              <Bot size={18} />
            </div>
            <div className="message-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={16} className="spinner" />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Analyzing medical observations & synthesizing clinical context...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Ask a question about your reports, cholesterol, liver enzymes, or trends..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <button 
          className="btn btn-primary"
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
        >
          <Send size={16} />
        </button>
      </div>

      <div className="disclaimer" style={{ marginTop: '8px', padding: '6px 12px' }}>
        * Educational assistant. Does not replace professional medical advice. No diagnoses or prescriptions are provided.
      </div>
    </div>
  );
}
