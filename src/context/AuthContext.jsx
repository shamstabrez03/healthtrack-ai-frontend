import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, familyAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('healthtrack_token');
    if (token) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userRes = await authAPI.getMe();
      setUser(userRes.data);

      const familyRes = await familyAPI.list();
      setPatients(familyRes.data);

      // Restore active patient from localStorage or default to 'self'
      const savedPatientId = localStorage.getItem('healthtrack_active_patient');
      const found = familyRes.data.find(p => p.id === savedPatientId);
      if (found) {
        setActivePatient(found);
      } else if (familyRes.data.length > 0) {
        const selfPatient = familyRes.data.find(p => p.relationship_type === 'self') || familyRes.data[0];
        setActivePatient(selfPatient);
        localStorage.setItem('healthtrack_active_patient', selfPatient.id);
      }
    } catch (err) {
      console.error('Failed to load user info', err);
      localStorage.removeItem('healthtrack_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('healthtrack_token', res.data.access_token);
    await loadUserData();
    toast.success('Logged in successfully');
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    localStorage.setItem('healthtrack_token', res.data.access_token);
    await loadUserData();
    toast.success('Account created successfully');
  };

  const logout = () => {
    localStorage.removeItem('healthtrack_token');
    localStorage.removeItem('healthtrack_active_patient');
    setUser(null);
    setPatients([]);
    setActivePatient(null);
    toast.success('Logged out');
  };

  const switchPatient = (patient) => {
    setActivePatient(patient);
    localStorage.setItem('healthtrack_active_patient', patient.id);
    toast.success(`Switched to profile: ${patient.name}`);
  };

  const refreshPatients = async () => {
    try {
      const familyRes = await familyAPI.list();
      setPatients(familyRes.data);
      if (activePatient) {
        const updated = familyRes.data.find(p => p.id === activePatient.id);
        if (updated) setActivePatient(updated);
      }
    } catch (err) {
      console.error('Failed to refresh patients', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        patients,
        activePatient,
        switchPatient,
        refreshPatients,
        login,
        register,
        logout,
        loadUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
