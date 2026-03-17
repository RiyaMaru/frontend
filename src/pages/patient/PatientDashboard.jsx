import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/my');
      // Sort by date descending
      const sorted = res.data.sort((a,b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
      setAppointments(sorted);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.delete(`/appointments/${id}`);
        fetchAppointments();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to cancel appointment');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
            <User size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold m-0">My Dashboard</h1>
            <p className="text-muted text-sm mt-1">View your upcoming and past appointments.</p>
          </div>
        </div>
        <Link to="/patient/book" className="primary" style={{ textDecoration: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', display: 'inline-block' }}>
          Book Appointment
        </Link>
      </div>

      {error && <div className="p-4 mb-4 rounded bg-red-50 text-red-600 border border-red-200">{error}</div>}

      <h2 className="text-xl font-bold mb-4">My Appointments</h2>
      
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
           <div className="animate-pulse" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Retrieving your appointments...</div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card shadow-md text-center" style={{ padding: '4rem' }}>
          <Calendar size={64} style={{ color: 'var(--text-light)', margin: '0 auto 1.5rem', opacity: 0.2 }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Start your healthcare journey</h3>
          <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto 2rem' }}>You haven't booked any appointments yet. Our world-class specialists are ready to help you.</p>
          <Link to="/patient/book" className="primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>Book Your First Visit</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
          {appointments.map(apt => (
            <div key={apt.id} className="glass-card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="flex justify-between items-start">
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                    Scheduled Session
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
                    {new Date(apt.appointmentDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  <div className="flex items-center gap-2 mt-1" style={{ color: 'var(--text-light)', fontSize: '1rem', fontWeight: 500 }}>
                    <Calendar size={14} /> {apt.timeSlot}
                  </div>
                </div>
                <span className={`badge ${apt.status.replace('-', '_')}`} style={{ padding: '0.5rem 1rem' }}>
                  {apt.status}
                </span>
              </div>
              
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', border: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Queue Token</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-dark)' }}>
                    {apt.queueEntry?.tokenNumber ? `#${apt.queueEntry.tokenNumber}` : '---'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Queue Status</div>
                  <div style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: 700, 
                    color: apt.queueEntry?.status === 'in-progress' ? 'var(--primary)' : 'var(--text-dark)',
                    background: apt.queueEntry?.status === 'in-progress' ? '#e0f2fe' : 'transparent',
                    padding: apt.queueEntry?.status === 'in-progress' ? '0.25rem 0.5rem' : 0,
                    borderRadius: '0.5rem'
                  }}>
                    {apt.queueEntry?.status?.toUpperCase() || 'NOT ASSIGNED'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {apt.status === 'scheduled' && (
                  <button 
                    className="danger" 
                    style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem', background: '#fee2e2', color: '#ef4444' }}
                    onClick={() => handleCancel(apt.id)}
                  >
                    Cancel Appointment
                  </button>
                )}
                {apt.status.toLowerCase() === 'done' && (
                  <Link to="/patient/records" className="secondary" style={{ flex: 1, textDecoration: 'none', textAlign: 'center', padding: '0.75rem', fontSize: '0.85rem' }}>
                    View Medical Record
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
