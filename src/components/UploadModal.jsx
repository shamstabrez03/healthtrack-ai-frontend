import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const { activePatient } = useAuth();
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(0); // 0: idle, 1: uploading, 2: extracting, 3: validating, 4: complete, -1: error
  const [extractedCount, setExtractedCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [liveMessage, setLiveMessage] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file || !activePatient) return;

    try {
      setProcessing(true);
      setStep(1); // 1. Uploading
      setLiveMessage('Securely transferring encrypted document to server...');

      const res = await reportsAPI.upload(file, activePatient.id);

      if (res.data.is_duplicate) {
        toast('This report was already uploaded earlier.', { icon: 'ℹ️' });
        setStep(4);
        setLiveMessage('Report already indexed in your health profile.');
        setTimeout(() => {
          onUploadSuccess && onUploadSuccess(res.data.id);
          handleClose();
        }, 1500);
        return;
      }

      const reportId = res.data.id;
      setStep(2); // 2. Extracting text & clinical data
      setLiveMessage('Scanning PDF pages & extracting clinical text with PyMuPDF...');

      // Polling: wait until backend completely finishes PyMuPDF extraction, Gemini parsing, range validation, DB persistence, and ChromaDB embeddings
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 90; // Up to 90 seconds for large PDFs

      while (!isDone && attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 1000));
        attempts++;

        try {
          const checkRes = await reportsAPI.get(reportId, activePatient.id);
          const currentStatus = checkRes.data.status;
          const obsCount = checkRes.data.observation_count || 0;
          const msg = checkRes.data.processing_message;

          if (msg) {
            setLiveMessage(msg);
          }

          if (currentStatus === 'extracting') {
            setStep(2);
          } else if (currentStatus === 'processing') {
            setStep(2);
          } else if (currentStatus === 'validating') {
            setStep(3);
          } else if (currentStatus === 'uploaded' && attempts > 3) {
            setStep(3);
          }

          if (currentStatus === 'completed' || currentStatus === 'requires_review') {
            isDone = true;
            setExtractedCount(obsCount);
            setStep(4); // 4. ChromaDB & Records Complete
            setLiveMessage(`Successfully extracted ${obsCount} observations & built vector embeddings.`);
            toast.success(`Report processed! ${obsCount} observations extracted.`);
            
            // Hold on screen for 1.6s so user sees full completion
            setTimeout(() => {
              onUploadSuccess && onUploadSuccess(reportId);
              handleClose();
            }, 1600);
            return;
          }

          if (currentStatus === 'failed') {
            throw new Error(checkRes.data.processing_message || 'Report processing encountered an error on the server.');
          }
        } catch (pollErr) {
          if (pollErr.response?.status === 404) {
            continue;
          }
          throw pollErr;
        }
      }

      if (!isDone) {
        throw new Error('Report processing timed out. Please check your Gemini API key in Settings.');
      }
    } catch (err) {
      console.error(err);
      setStep(-1);
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to upload and process report.');
      toast.error('Upload failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setStep(0);
    setErrorMsg('');
    setProcessing(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Upload Medical Report</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Assigning to profile: <strong style={{ color: 'var(--primary)' }}>{activePatient?.name}</strong>
            </p>
          </div>
          <button className="modal-close" onClick={handleClose} disabled={processing}>
            <X size={20} />
          </button>
        </div>

        {step === 0 && (
          <div>
            <div
              className={`upload-zone ${dragOver ? 'dragover' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={48} color="var(--primary)" style={{ margin: '0 auto' }} />
              <h3>Drag & Drop your medical report here</h3>
              <p>Supports PDF, JPG, PNG (e.g., Blood Test, CBC, LFT, Lipid Profile, Ultrasound, X-Ray)</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ marginTop: '16px' }}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                Browse Files
              </button>
            </div>

            {file && (
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={20} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{file.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button 
                  className="btn btn-sm btn-secondary" 
                  onClick={() => setFile(null)}
                >
                  Remove
                </button>
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                disabled={!file} 
                onClick={handleSubmit}
              >
                Process Report
              </button>
            </div>
          </div>
        )}

        {step > 0 && (
          <div style={{ padding: '16px 0' }}>
            <ul className="processing-steps">
              <li className={`processing-step ${step > 1 ? 'completed' : step === 1 ? 'active' : 'pending'}`}>
                <div className="step-icon">
                  {step > 1 ? <CheckCircle2 size={18} color="var(--status-normal)" /> : <Loader2 size={16} className="spinner" />}
                </div>
                <div>
                  <strong>Uploading Document</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Securely transferring encrypted document</div>
                </div>
              </li>

              <li className={`processing-step ${step > 2 ? 'completed' : step === 2 ? 'active' : 'pending'}`}>
                <div className="step-icon">
                  {step > 2 ? <CheckCircle2 size={18} color="var(--status-normal)" /> : step === 2 ? <Loader2 size={16} className="spinner" /> : '2'}
                </div>
                <div>
                  <strong>Extracting Text & Clinical Data</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PyMuPDF page scanning & Gemini observation parsing</div>
                </div>
              </li>

              <li className={`processing-step ${step > 3 ? 'completed' : step === 3 ? 'active' : 'pending'}`}>
                <div className="step-icon">
                  {step > 3 ? <CheckCircle2 size={18} color="var(--status-normal)" /> : step === 3 ? <Loader2 size={16} className="spinner" /> : '3'}
                </div>
                <div>
                  <strong>Validating & Normalizing</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Canonical test matching & reference range evaluation</div>
                </div>
              </li>

              <li className={`processing-step ${step === 4 ? 'completed' : 'pending'}`}>
                <div className="step-icon">
                  {step === 4 ? <CheckCircle2 size={18} color="var(--status-normal)" /> : '4'}
                </div>
                <div>
                  <strong>ChromaDB Embedding & Record Persistence</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Building semantic index & longitudinal health records</div>
                </div>
              </li>
            </ul>

            {step > 0 && step < 4 && liveMessage && (
              <div style={{
                marginTop: '16px',
                padding: '10px 14px',
                background: 'var(--primary-bg)',
                border: '1px solid var(--primary-lighter)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.8125rem',
                color: 'var(--primary)'
              }}>
                <Loader2 size={16} className="spinner" />
                <span>{liveMessage}</span>
              </div>
            )}

            {step === 4 && (
              <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--status-normal)' }}>
                <strong>
                  {liveMessage || (extractedCount > 0 ? `Report processed! ${extractedCount} clinical observations extracted & embedded.` : 'Report processed and added to health records!')}
                </strong>
              </div>
            )}
          </div>
        )}

        {step === -1 && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <AlertCircle size={48} color="var(--status-urgent)" style={{ margin: '0 auto 16px' }} />
            <h3>Processing Encountered an Issue</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '8px 0 24px', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
              {errorMsg}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setStep(0)}>
                Try Again
              </button>
              {errorMsg.toLowerCase().includes('gemini') && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    handleClose();
                    window.location.href = '/settings';
                  }}
                >
                  Configure API Key
                </button>
              )}
            </div>
          </div>
        )}

        <div className="disclaimer">
          Your report is processed securely in compliance with strict patient isolation rules.
        </div>
      </div>
    </div>
  );
}
