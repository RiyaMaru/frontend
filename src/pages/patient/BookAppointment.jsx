import React, { useState } from 'react';
import api from '../../api/axios';
import { CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const timeSlots = [
  "09:00-09:15", "09:15-09:30", "09:30-09:45", "09:45-10:00",
  "10:00-10:15", "10:15-10:30", "10:30-10:45", "10:45-11:00",
  "11:00-11:15", "11:15-11:30", "11:30-11:45", "11:45-12:00"
];

const BookAppointment = () => {
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !slot) {
      setError("Please select both a date and a time slot.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.post('/appointments', {
        appointmentDate: date,
        timeSlot: slot
      });
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book appointment. The slot might be taken.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="animate-fade-in flex justify-center p-4">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-4 rounded-full mb-4" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <CalendarPlus size={36} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 className="text-2xl font-bold">Book an Appointment</h1>
          <p className="text-muted mt-2">Select your preferred date and time to visit the clinic.</p>
        </div>

        {error && <div className="p-4 mb-6 rounded bg-red-50 text-red-600 border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="flex-col gap-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-700">Select Date</label>
            <input 
              type="date" 
              required 
              min={today}
              value={date} 
              onChange={e => setDate(e.target.value)}
              style={{ padding: '1rem', fontSize: '1rem' }}
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold mb-3 text-gray-700">Select Time Slot</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {timeSlots.map(t => (
                <div 
                  key={t}
                  onClick={() => setSlot(t)}
                  style={{ 
                    padding: '0.75rem', 
                    textAlign: 'center', 
                    borderRadius: '0.5rem', 
                    border: slot === t ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                    background: slot === t ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.6)',
                    color: slot === t ? 'var(--primary)' : 'var(--text-dark)',
                    fontWeight: slot === t ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="hover:border-indigo-300"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="primary w-full" style={{ padding: '1rem', fontSize: '1.05rem' }} disabled={loading}>
            {loading ? 'Confirming Booking...' : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
