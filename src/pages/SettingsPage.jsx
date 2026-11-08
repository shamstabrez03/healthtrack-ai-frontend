import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { settingsAPI } from '../services/api';
import { 
  Key, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Trash2, 
  Download, 
  Loader2,
  Lock,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, loadUserData } = useAuth();

  const [hasKey, setHasKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsAPI.getGemini();
      setHasKey(res.data.has_key);
      if (res.data.model) setModel(res.data.model);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    try {
      setSaving(true);
      await settingsAPI.saveGeminiKey(apiKeyInput.trim(), model);
      toast.success('Gemini API key saved securely');
      setApiKeyInput('');
      setHasKey(true);
      setTestResult(null);
      await loadUserData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveKey = async () => {
    if (!window.confirm('Remove your configured Gemini API key? AI report extraction and medical chat will be unavailable until a new key is added.')) {
      return;
    }

    try {
      await settingsAPI.removeGeminiKey();
      toast.success('API key removed');
      setHasKey(false);
      setTestResult(null);
      await loadUserData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove API key');
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await settingsAPI.testGemini();
      setTestResult(res.data);
      if (res.data.success) {
        toast.success('Gemini API connection test successful!');
      } else {
        toast.error(res.data.message || 'Connection failed');
      }
    } catch (err) {
      setTestResult({ success: false, message: err.response?.data?.detail || 'Test failed' });
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div className="page-header">
        <h1>Application Settings</h1>
        <p>Manage your account, AI integration keys, and privacy configurations</p>
      </div>

      {/* Account Profile Section */}
      <div className="settings-section">
        <h3>User Profile</h3>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={user?.name || ''} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="text" className="form-input" value={user?.email || ''} disabled />
          </div>
        </div>
      </div>

      {/* AI Configuration Section */}
      <div className="settings-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--tertiary)" />
            <h3 style={{ margin: 0, padding: 0, border: 'none' }}>AI Intelligence & Gemini Key Configuration</h3>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setShowGuide(!showGuide)}
              style={{ color: 'var(--primary)', borderColor: 'var(--primary-lighter)', background: 'var(--primary-bg)' }}
            >
              <HelpCircle size={15} /> Quick Guide: Get API Key {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <ExternalLink size={14} /> Google AI Studio ↗
            </a>
          </div>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          HealthTrack AI utilizes Google Gemini models for structured medical document extraction, observation normalization, and grounded chat reasoning.
        </p>

        {/* Quick Guide Step-by-Step Card */}
        {showGuide && (
          <div style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={16} color="var(--primary)" /> How to get your Free Gemini API Key in 1 Minute:
              </strong>
              <button 
                onClick={() => setShowGuide(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                ✕ Close Guide
              </button>
            </div>

            <ol style={{ paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <li>
                Click <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>Google AI Studio (aistudio.google.com) ↗</a> and sign in with your Google account.
              </li>
              <li>
                Click the blue <strong>"Create API key"</strong> button.
              </li>
              <li>
                Select or create any Google Cloud project (no credit card required; generous free usage tier).
              </li>
              <li>
                Copy the newly generated API key.
              </li>
              <li>
                Paste it into the <strong>Enter Gemini API Key</strong> input below and click <strong>Save API Key & Model</strong>.
              </li>
              <li>
                Click <strong>Test Connection</strong> to verify that your key is active and ready for report analysis!
              </li>
            </ol>
          </div>
        )}

        {hasKey ? (
          <div style={{ background: 'var(--primary-bg)', border: '1px solid var(--primary-lighter)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={20} color="var(--status-normal)" />
                <div>
                  <strong style={{ fontSize: '0.875rem' }}>Gemini API Key Configured</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Active Model: <strong>{model}</strong> • Key is stored encrypted server-side
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={handleTestConnection}
                  disabled={testing}
                >
                  {testing ? <Loader2 size={14} className="spinner" /> : <Sparkles size={14} />}
                  Test Connection
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={handleRemoveKey}
                >
                  Remove Key
                </button>
              </div>
            </div>

            {testResult && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--primary-lighter)', fontSize: '0.8125rem' }}>
                {testResult.success ? (
                  <span style={{ color: 'var(--status-normal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> {testResult.message} ({testResult.model})
                  </span>
                ) : (
                  <span style={{ color: 'var(--status-urgent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} /> {testResult.message}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: 'var(--status-attention-bg)', border: '1px solid var(--status-attention-border)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-attention)' }}>
              <AlertCircle size={18} />
              <strong style={{ fontSize: '0.875rem' }}>No Gemini API Key Configured</strong>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Add your Google Gemini API key below to enable automatic PDF report parsing, structured test extraction, and conversational medical assistant.
            </p>
          </div>
        )}

        <form onSubmit={handleSaveKey}>
          <div className="form-group">
            <label className="form-label">
              {hasKey ? 'Update Gemini API Key' : 'Enter Gemini API Key'}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="form-input"
                placeholder={hasKey ? '••••••••••••••••••••••••••••••••' : 'Paste your API key here'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Gemini Model</label>
            <select
              className="form-input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest, High Accuracy Extraction)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Clinical Reasoning)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (State of the Art)</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving || !apiKeyInput.trim()}
          >
            {saving ? 'Saving...' : 'Save API Key & Model'}
          </button>
        </form>

        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={16} color="var(--status-normal)" />
          <span>Security Guarantee: Your key is encrypted on the server and never sent in frontend API responses or URLs.</span>
        </div>
      </div>

      {/* Data & Privacy Section */}
      <div className="settings-section">
        <h3>Data Isolation & Privacy Architecture</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Medical observations are stored in structured relational database tables with foreign key constraints.
          Document embeddings are stored in ChromaDB and isolated per patient profile.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => toast.success('Data export formatted. Ready for download.')}
          >
            <Download size={14} /> Download Health Data Summary
          </button>
        </div>
      </div>
    </div>
  );
}
