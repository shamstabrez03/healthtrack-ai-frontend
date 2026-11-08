import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Menu, Activity } from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import UploadModal from './components/UploadModal';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';
import TrendsPage from './pages/TrendsPage';
import ChatPage from './pages/ChatPage';
import FamilyPage from './pages/FamilyPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedLayout() {
  const { user, loading, activePatient, refreshPatients } = useAuth();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="loading-overlay" style={{ height: '100vh' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Initializing HealthTrack AI session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleUploadSuccess = () => {
    refreshPatients();
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="app-layout">
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <button 
          className="mobile-menu-btn" 
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <div className="mobile-header-brand">
          <Activity size={20} color="var(--primary)" />
          <span>HealthTrack AI</span>
        </div>
        <div className="mobile-profile-pill">
          {activePatient?.name || user?.name || 'Profile'}
        </div>
      </header>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)} 
          aria-hidden="true" 
        />
      )}

      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenUpload={() => {
          setSidebarOpen(false);
          setUploadModalOpen(true);
        }} 
      />
      
      <main className="main-content">
        <Routes>
          <Route 
            path="/dashboard" 
            element={<DashboardPage key={`dash-${refreshKey}`} onOpenUpload={() => setUploadModalOpen(true)} />} 
          />
          <Route 
            path="/reports" 
            element={<ReportsPage key={`rep-${refreshKey}`} onOpenUpload={() => setUploadModalOpen(true)} />} 
          />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <UploadModal 
        isOpen={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
