import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { List, CheckCircle, PlayCircle, XCircle, Edit3, Trash2 } from 'lucide-react';

const DailyQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('all');

  const fetchQueue = async (selectedDate) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/queue?date=${selectedDate}`);
      setQueue(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(date);
  }, [date]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/queue/${id}`, { status: newStatus });
      fetchQueue(date);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this patient from the daily queue?')) {
      try {
        await api.delete(`/queue/${id}`);
        fetchQueue(date);
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to remove from queue');
      }
    }
  };

  const handleEditToken = async (id, currentToken) => {
    const newToken = prompt('Update Token Number:', currentToken);
    if (newToken && newToken !== currentToken) {
      try {
        await api.patch(`/queue/${id}`, { tokenNumber: parseInt(newToken) });
        fetchQueue(date);
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to update token');
      }
    }
  };

  const filteredQueue = queue.filter(q => {
    const patientName = q.appointment?.patient?.name?.toLowerCase() || '';
    const doctorName = q.appointment?.doctor?.name?.toLowerCase() || '';
    const matchSearch = patientName.includes(searchTerm.toLowerCase()) || 
                      doctorName.includes(searchTerm.toLowerCase()) ||
                      q.tokenNumber.toString().includes(searchTerm);
    const matchDoctor = doctorFilter === 'all' || q.appointment?.doctor?.name === doctorFilter;
    return matchSearch && matchDoctor;
  });

  const doctors = [...new Set(queue.map(q => q.appointment?.doctor?.name).filter(Boolean))];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
            <List size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold m-0">Daily Management Centre</h1>
            <p className="text-muted text-sm mt-1">Real-time patient flow for {new Date(date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="secondary" onClick={() => fetchQueue(date)} style={{ padding: '0.75rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
          </button>
          <div className="glass-panel" style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '0.75rem' }}>
            <label className="font-bold text-xs text-muted uppercase tracking-wider">Queue Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              style={{ padding: '0.25rem', background: 'transparent', border: 'none', fontWeight: 600, outline: 'none', color: 'var(--text-dark)' }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 glass-panel" style={{ padding: '0.25rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '0.75rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
             type="text" 
             placeholder="Search by patient name, token, or doctor..." 
             className="w-full"
             style={{ background: 'transparent', border: 'none', padding: '0.75rem 0', outline: 'none', fontSize: '0.95rem' }}
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="glass-panel" 
          style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', outline: 'none', border: '1px solid rgba(255,255,255,0.5)', fontWeight: 600 }}
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
        >
          <option value="all">All Clinicians</option>
          {doctors.map(doc => <option key={doc} value={doc}>Dr. {doc}</option>)}
        </select>
      </div>

      {error && <div className="p-4 mb-4 rounded bg-red-50 text-red-600 border border-red-200">{error}</div>}

      <div className="card shadow-md" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
             <div className="animate-pulse" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Syncing Management Console...</div>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
             <List size={48} style={{ margin: '0 auto 1rem', opacity: 0.1 }} />
             <p className="font-medium">No results found for current filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ width: '100px' }}>Token</th>
                  <th>Patient Information</th>
                  <th>Assigned Doctor</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '2.5rem' }}>Workflow Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map(q => {
                   const statusKey = q.status.replace('-', '_');
                   return (
                    <tr key={q.id}>
                      <td>
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: '12px', 
                          background: q.status === 'in-progress' ? 'var(--primary)' : '#f8fafc',
                          color: q.status === 'in-progress' ? 'white' : 'var(--warning)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '1.1rem',
                          border: '2px solid' + (q.status === 'in-progress' ? 'var(--primary)' : '#f1f5f9')
                        }}>
                          #{q.tokenNumber}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--text-dark)', fontSize: '1rem' }}>
                          {q.appointment?.patient?.name || 'Walk-in Patient'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.1rem' }}>
                          ID: #{q.appointment?.patient?.id?.slice(-6) || 'N/A'} • {q.appointment?.patient?.phone}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                           <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }}></div>
                           <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Dr. {q.appointment?.doctor?.name || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${statusKey}`}>
                          {q.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                        <div className="flex justify-end gap-3">
                          {/* Normalize status for robust checking */}
                          {(() => {
                            const normalizedStatus = q.status.toLowerCase().replace('_', '-');
                            return (
                              <>
                                {normalizedStatus === 'waiting' && (
                                  <>
                                    <button className="primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => updateStatus(q.id, 'in-progress')}>
                                      <PlayCircle size={14} /> Call Patient
                                    </button>
                                    <button className="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--danger)' }} onClick={() => updateStatus(q.id, 'skipped')}>
                                      <XCircle size={14} /> Skip
                                    </button>
                                  </>
                                )}
                                {(normalizedStatus === 'waiting' || normalizedStatus === 'in-progress') && (
                                  <button className="primary" style={{ background: 'var(--secondary)', padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => updateStatus(q.id, 'done')}>
                                    <CheckCircle size={14} /> Mark Done
                                  </button>
                                )}
                                {(normalizedStatus === 'done' || normalizedStatus === 'skipped') && (
                                  <div style={{ padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.6rem', fontSize: '0.75rem', color: 'var(--text-light)', border: '1px solid #f1f5f9', fontWeight: 600 }}>
                                    {q.status.toUpperCase()}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                          {/* Admin/Receptionist general management */}
                          <div className="flex gap-2 ml-2" style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '1rem' }}>
                            <button 
                              className="secondary" 
                              onClick={() => handleEditToken(q.id, q.tokenNumber)}
                              style={{ padding: '0.5rem', borderRadius: '0.5rem' }}
                              title="Edit Token"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              className="secondary" 
                              onClick={() => handleDelete(q.id)}
                              style={{ padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--danger)' }}
                              title="Delete Entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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
    </div>
  );
};

export default DailyQueue;
