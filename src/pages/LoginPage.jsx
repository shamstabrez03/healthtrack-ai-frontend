import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Brand Hero Left Side */}
      <div className="login-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
            <Activity size={32} color="#FFFFFF" />
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>HealthTrack AI</span>
        </div>

        <h1>Understand your reports. Track your health over time.</h1>
        <p className="tagline">
          AI-powered medical report intelligence with deterministic longitudinal tracking and privacy-first data isolation.
        </p>

        <ul className="login-features">
          <li>
            <ShieldCheck size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Structured Medical Extraction</strong>
              <span>Converts multi-page diagnostic PDFs into normalized clinical metrics with full traceability.</span>
            </div>
          </li>
          <li>
            <TrendingUp size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Longitudinal Health Analytics</strong>
              <span>Visualizes historical trends, automatically computing delta & percentage changes across checkups.</span>
            </div>
          </li>
          <li>
            <Sparkles size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Grounded AI Health Assistant</strong>
              <span>Ask questions about your reports, powered by Gemini and ChromaDB hybrid retrieval.</span>
            </div>
          </li>
        </ul>

        <div style={{ marginTop: 'auto', paddingTop: '32px', fontSize: '0.8125rem', opacity: 0.8, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          * Educational platform. Does not replace professional medical advice.
        </div>
      </div>

      {/* Auth Form Right Side */}
      <div className="login-form-side">
        <div className="login-form">
          <h2>{isRegister ? 'Create your profile' : 'Welcome back'}</h2>
          <p>{isRegister ? 'Start tracking your family health history' : 'Sign in to access your medical records'}</p>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Shams Tabrez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem' }}>
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Create Account
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
