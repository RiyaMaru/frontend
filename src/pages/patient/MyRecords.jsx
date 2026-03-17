import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FileText, Pill, FileClock } from 'lucide-react';

const MyRecords = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const [prescRes, repRes] = await Promise.all([
          api.get('/prescriptions/my'),
          api.get('/reports/my')
        ]);
        setPrescriptions(prescRes.data);
        setReports(repRes.data);
      } catch (err) {
        console.error('Failed to fetch records', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted">Loading your medical records...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
          <FileClock size={32} style={{ color: 'var(--secondary)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold m-0">My Medical Records</h1>
          <p className="text-muted text-sm mt-1">Review your past prescriptions and diagnostic reports.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2.5rem' }}>
        
        {/* Prescriptions Column */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div style={{ padding: '0.75rem', background: '#e0f2fe', borderRadius: '0.75rem', color: '#0369a1' }}>
              <Pill size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Prescriptions</h2>
          </div>

          {prescriptions.length === 0 ? (
            <div className="card shadow-sm text-center" style={{ padding: '3rem', opacity: 0.6 }}>
              <Pill size={48} style={{ margin: '0 auto 1rem' }} />
              <p>No prescriptions on file.</p>
            </div>
          ) : (
            <div className="flex-col gap-6">
              {prescriptions.map(p => (
                <div key={p.id} className="glass-card animate-fade-in" style={{ padding: '2rem', overflow: 'hidden' }}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                        Healthcare Provider
                      </div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Dr. {p.doctor?.name}</h4>
                      <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Issued on {new Date(p.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Medicine</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Dosage</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Duration</span>
                    </div>
                    {p.medicines?.map((m, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', padding: '0.75rem 0', borderBottom: i === p.medicines.length - 1 ? 'none' : '1px dashed #e2e8f0' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{m.name}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-light)', fontSize: '0.85rem' }}>{m.dosage}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-light)', fontSize: '0.85rem' }}>{m.duration}</span>
                      </div>
                    ))}
                  </div>

                  {p.notes && (
                    <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#fffbeb', borderRadius: '1rem', border: '1px solid #fef3c7', position: 'relative' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         Clinical Notes
                      </div>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: '#92400e', lineHeight: 1.5 }}>{p.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reports Column */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div style={{ padding: '0.75rem', background: '#dcfce3', borderRadius: '0.75rem', color: '#15803d' }}>
              <FileText size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Diagnostic Reports</h2>
          </div>

          {reports.length === 0 ? (
            <div className="card shadow-sm text-center" style={{ padding: '3rem', opacity: 0.6 }}>
              <FileText size={48} style={{ margin: '0 auto 1rem' }} />
              <p>No reports on file.</p>
            </div>
          ) : (
            <div className="flex-col gap-6">
              {reports.map(r => (
                <div key={r.id} className="glass-card animate-fade-in" style={{ padding: '2rem', borderLeft: '6px solid var(--secondary)' }}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                        Final Diagnosis
                      </div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-dark)', margin: 0 }}>{r.diagnosis}</h3>
                      <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Validated by Dr. {r.doctor?.name} • {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {r.testRecommended && (
                      <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Recommended Observations</p>
                        <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-dark)' }}>{r.testRecommended}</p>
                      </div>
                    )}
                    
                    {r.remarks && (
                      <div style={{ padding: '1.25rem', background: '#f0fdf4', borderRadius: '1rem', border: '1px solid #dcfce3' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Physician's Remarks</p>
                        <p style={{ margin: 0, fontSize: '1rem', color: '#15803d', lineHeight: 1.6 }}>{r.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyRecords;
