import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, Calendar, Activity, Building2 } from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const res = await api.get('/admin/clinic');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClinic();
  }, []);

  if (loading) return <div className="p-4 text-muted">Loading dashboard...</div>;
  if (!data) return <div className="p-4 text-danger">Failed to load clinic info.</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-4 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
          <Building2 size={32} style={{ color: 'var(--primary)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold m-0">{data.name}</h1>
          <p className="text-muted text-sm mt-1">Code: <span style={{fontWeight: 600}}>{data.code}</span></p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card flex items-center gap-5" style={{ padding: '1.5rem' }}>
          <div className="p-4" style={{ background: 'rgba(20, 184, 166, 0.15)', color: 'var(--secondary)', borderRadius: '1rem' }}>
            <Users size={28} />
          </div>
          <div>
            <p className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Total Users</p>
            <h3 className="text-3xl font-bold m-0">{data.userCount}</h3>
          </div>
        </div>

        <div className="glass-card flex items-center gap-5" style={{ padding: '1.5rem' }}>
          <div className="p-4" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', borderRadius: '1rem' }}>
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Total Appointments</p>
            <h3 className="text-3xl font-bold m-0">{data.appointmentCount}</h3>
          </div>
        </div>

        <div className="glass-card flex items-center gap-5" style={{ padding: '1.5rem' }}>
          <div className="p-4" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', borderRadius: '1rem' }}>
            <Activity size={28} />
          </div>
          <div>
            <p className="text-muted text-xs font-bold uppercase tracking-wider mb-1">Total Queued</p>
            <h3 className="text-3xl font-bold m-0">{data.queueCount}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


