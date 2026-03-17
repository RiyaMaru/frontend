import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';
import { Stethoscope, FileText, Pill, Plus, X, Activity } from 'lucide-react';

const DoctorQueue = () => {
  const { user } = useContext(AuthContext);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [activeModal, setActiveModal] = useState(null); // 'prescription' | 'report' | null
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [error, setError] = useState('');
  
  // Forms
  const [reportForm, setReportForm] = useState({ diagnosis: '', testRecommended: '', remarks: '' });
  const [prescNotes, setPrescNotes] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '' }]);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/doctor/queue');
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  const openModal = (type, apptId) => {
    setError('');
    setSelectedAppointment(apptId);
    setActiveModal(type);
    if (type === 'report') setReportForm({ diagnosis: '', testRecommended: '', remarks: '' });
    if (type === 'prescription') {
      setPrescNotes('');
      setMedicines([{ name: '', dosage: '', duration: '' }]);
    }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/reports/${selectedAppointment}`, reportForm);
      setActiveModal(null);
      alert("Report saved successfully!");
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report. It may already exist.');
    }
  };

  const submitPrescription = async (e) => {
    e.preventDefault();
    setError('');
    // filter out empty medicines just in case
    const validMeds = medicines.filter(m => m.name.trim() !== '' && m.dosage.trim() !== '' && m.duration.trim() !== '');
    if (validMeds.length === 0) {
      setError("Please add at least one complete medicine entry.");
      return;
    }
    try {
      await api.post(`/prescriptions/${selectedAppointment}`, {
        medicines: validMeds,
        notes: prescNotes
      });
      setActiveModal(null);
      alert("Prescription saved successfully!");
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit prescription. It may already exist.');
    }
  };

  const handleMedChange = (index, field, value) => {
    const newMeds = [...medicines];
    newMeds[index][field] = value;
    setMedicines(newMeds);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '' }]);
  };

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
            Today's Clinical Queue
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>
            Manage and document patient sessions for today.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '700', color: 'var(--text-dark)', fontSize: '1.1rem' }}>Dr. {user?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>ONLINE • {queue.length} PATIENTS</div>
          </div>
          <div style={{ 
            width: '52px', 
            height: '52px', 
            background: 'var(--primary)', 
            borderRadius: '1.25rem', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Stethoscope size={26} />
          </div>
        </div>
      </div>

      {/* Main Queue Table */}
      <div className="card shadow-lg" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
             <Activity className="animate-pulse" size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
             <p>Syncing queue data...</p>
          </div>
        ) : queue.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
             <p>No patients scheduled for today.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '800px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '1.25rem', width: '120px' }}>Token</th>
                  <th>Patient Name</th>
                  <th>Visit Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '2.5rem' }}>Clinical Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map(q => {
                   const statusKey = q.status.replace('-', '_');
                   const isReady = ['in_progress', 'done'].includes(statusKey);
                   
                   return (
                    <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: '12px', 
                          background: isReady ? 'var(--primary)' : '#f1f5f9',
                          color: isReady ? 'white' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '1.1rem'
                        }}>
                          #{q.tokenNumber}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--text-dark)', fontSize: '1rem' }}>{q.patientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Appointment ID: {q.appointmentId}</div>
                      </td>
                      <td>
                        <span className="badge" style={{ 
                          background: statusKey === 'done' ? '#dcfce3' : statusKey === 'in_progress' ? '#e0f2fe' : '#f1f5f9',
                          color: statusKey === 'done' ? '#15803d' : statusKey === 'in_progress' ? '#0369a1' : '#64748b',
                          padding: '0.4rem 0.8rem'
                        }}>
                          {q.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                          {isReady ? (
                            <>
                              <button 
                                className="secondary" 
                                onClick={() => openModal('prescription', q.appointmentId)}
                                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                              >
                                <Pill size={16} /> Prescribe
                              </button>
                              <button 
                                className="secondary" 
                                onClick={() => openModal('report', q.appointmentId)}
                                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                              >
                                <FileText size={16} /> Clinical Report
                              </button>
                            </>
                          ) : (
                            <div style={{ padding: '0.6rem 1rem', background: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--text-light)', border: '1px solid #e2e8f0' }}>
                              <span className="animate-pulse">●</span> Waiting for Receptionist
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals with Fixed Premium Overlay */}
      {activeModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 9999, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          {/* Backdrop */}
          <div 
            onClick={() => setActiveModal(null)}
            style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'rgba(15, 23, 42, 0.75)', 
              backdropFilter: 'blur(10px)' 
            }}
          />

          {/* Modal Content Card */}
          <div className="animate-fade-in" style={{ 
            position: 'relative',
            width: '100%', 
            maxWidth: activeModal === 'prescription' ? '700px' : '500px', 
            background: 'white', 
            borderRadius: '1.5rem',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            maxHeight: 'calc(100vh - 3rem)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{ 
              padding: '2rem', 
              background: '#1e293b', 
              color: 'white',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                {activeModal === 'prescription' ? <Pill size={24} color="var(--primary)"/> : <FileText size={24} color="#10b981"/>}
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
                  Add {activeModal === 'prescription' ? 'Prescription' : 'Clinical Report'}
                </h2>
              </div>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                Complete the clinical documentation below for your records.
              </p>
            </div>

            {/* Scrollable Form Body */}
            <div style={{ padding: '2rem', overflowY: 'auto' }}>
              {error && (
                <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}
            
              {activeModal === 'report' && (
                <form onSubmit={submitReport} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Diagnosis</label>
                    <input type="text" required value={reportForm.diagnosis} onChange={e => setReportForm({...reportForm, diagnosis: e.target.value})} placeholder="e.g. Chronic Hypertension" style={{ border: '2px solid #e2e8f0', height: '52px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Recommended Tests</label>
                    <input type="text" value={reportForm.testRecommended} onChange={e => setReportForm({...reportForm, testRecommended: e.target.value})} placeholder="e.g. ECG, Complete Blood Count" style={{ border: '2px solid #e2e8f0', height: '52px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Clinical Remarks</label>
                    <textarea rows="4" value={reportForm.remarks} onChange={e => setReportForm({...reportForm, remarks: e.target.value})} placeholder="Patient advised bed rest and sodium restriction..." style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem' }}></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setActiveModal(null)} className="secondary" style={{ flex: 1, height: '52px' }}>Cancel</button>
                    <button type="submit" className="primary" style={{ flex: 2, height: '52px' }}>Save Report</button>
                  </div>
                </form>
              )}

              {activeModal === 'prescription' && (
                <form onSubmit={submitPrescription} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Medication List</h3>
                      <button type="button" onClick={addMedicine} className="primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '0.5rem' }}>
                        <Plus size={16}/> Add Medicine
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {medicines.map((med, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                          <div style={{ flex: 2 }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.25rem', display: 'block' }}>MEDICINE NAME</label>
                            <input type="text" required placeholder="e.g. Paracetamol" value={med.name} onChange={e => handleMedChange(idx, 'name', e.target.value)} style={{ border: 'none', background: '#f1f5f9', height: '40px', padding: '0 0.75rem', borderRadius: '0.5rem' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.25rem', display: 'block' }}>DOSAGE</label>
                            <input type="text" required placeholder="500mg" value={med.dosage} onChange={e => handleMedChange(idx, 'dosage', e.target.value)} style={{ border: 'none', background: '#f1f5f9', height: '40px', padding: '0 0.75rem', borderRadius: '0.5rem' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.25rem', display: 'block' }}>DURATION</label>
                            <input type="text" required placeholder="5 days" value={med.duration} onChange={e => handleMedChange(idx, 'duration', e.target.value)} style={{ border: 'none', background: '#f1f5f9', height: '40px', padding: '0 0.75rem', borderRadius: '0.5rem' }} />
                          </div>
                          {medicines.length > 1 && (
                            <button type="button" onClick={() => removeMedicine(idx)} style={{ color: '#ef4444', background: 'none', padding: '0', border: 'none', marginTop: '1.2rem' }}>
                              <X size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Pharmacy Instructions</label>
                    <textarea rows="3" value={prescNotes} onChange={e => setPrescNotes(e.target.value)} placeholder="Take one tablet twice daily after meals..." style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem' }}></textarea>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setActiveModal(null)} className="secondary" style={{ flex: 1, height: '52px' }}>Cancel</button>
                    <button type="submit" className="primary" style={{ flex: 2, height: '52px' }}>Finalize Prescription</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorQueue;
