import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { familyAPI } from '../services/api';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  UserPlus, 
  Calendar, 
  FileText, 
  ShieldCheck,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FamilyPage() {
  const { patients, activePatient, switchPatient, refreshPatients } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const [name, setName] = useState('');
  const [relationshipType, setRelationshipType] = useState('father');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('male');
  const [submitting, setSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingPatient(null);
    setName('');
    setRelationshipType('father');
    setDob('');
    setGender('male');
    setModalOpen(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setName(patient.name);
    setRelationshipType(patient.relationship_type);
    setDob(patient.date_of_birth || '');
    setGender(patient.gender || 'male');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      setSubmitting(true);
      if (editingPatient) {
        await familyAPI.update(editingPatient.id, {
          name,
          relationship_type: relationshipType,
          date_of_birth: dob || null,
          gender,
        });
        toast.success('Family member updated');
      } else {
        await familyAPI.create({
          name,
          relationship_type: relationshipType,
          date_of_birth: dob || null,
          gender,
        });
        toast.success('Family member added');
      }
      await refreshPatients();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to save family member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (patientId, patientName) => {
    if (!window.confirm(`Delete profile for ${patientName}? ALL their uploaded reports, extracted observations, and ChromaDB vector memories will be permanently deleted.`)) {
      return;
    }

    try {
      await familyAPI.delete(patientId);
      toast.success('Family profile and associated data deleted');
      await refreshPatients();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to delete profile');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Family Health Profiles</h1>
          <p>
            Manage individual family members with complete medical record and vector privacy isolation
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          <UserPlus size={16} /> Add Family Member
        </button>
      </div>

      {/* Grid of Profile Cards */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        {patients.map((p) => {
          const isActive = activePatient?.id === p.id;
          return (
            <div key={p.id} className={`family-card ${isActive ? 'active' : ''}`}>
              <div className="avatar">
                {p.name.charAt(0).toUpperCase()}
              </div>

              <h3>{p.name}</h3>
              <p style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: 'var(--primary)', fontSize: '0.75rem', marginBottom: '12px' }}>
                {p.relationship_type}
              </p>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                  <FileText size={14} color="var(--text-muted)" />
                  <span><strong>{p.report_count || 0}</strong> medical reports</span>
                </div>
                {p.last_report_date && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Last report: {p.last_report_date}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: 'auto' }}>
                {isActive ? (
                  <span className="btn btn-sm btn-secondary" style={{ color: 'var(--primary)', borderColor: 'var(--primary)', cursor: 'default' }}>
                    <Check size={14} /> Active Profile
                  </span>
                ) : (
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => switchPatient(p)}
                  >
                    Switch Profile
                  </button>
                )}

                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => openEditModal(p)}
                  title="Edit details"
                >
                  <Edit size={14} />
                </button>

                {p.relationship_type !== 'self' && (
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(p.id, p.name)}
                    title="Delete profile and data"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Member Card */}
        <div className="card add-member-card" onClick={openAddModal}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Plus size={24} />
          </div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Add Family Member</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Father, Mother, Child, etc.</span>
        </div>
      </div>

      {/* Security Isolation Notice */}
      <div className="card" style={{ background: 'var(--bg-white)', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <ShieldCheck size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '0.9375rem', marginBottom: '4px' }}>Strict Patient Isolation Guarantee</h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Each family profile has completely segregated database tables, historical timelines, and ChromaDB vector collections.
            AI chat and trend queries strictly filter context by active patient ID, ensuring zero data contamination across family members.
          </p>
        </div>
      </div>

      {/* Add / Edit Profile Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPatient ? 'Edit Family Profile' : 'Add Family Member'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Father, Mother, John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Relationship</label>
                <select
                  className="form-input"
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value)}
                >
                  <option value="self">Self</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-input"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth (Optional)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingPatient ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
