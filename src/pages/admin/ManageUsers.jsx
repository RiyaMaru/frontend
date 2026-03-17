import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Users, Edit3, Trash2 } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'patient', phone: '' });
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/admin/users/${editingId}`, formData);
      } else {
        await api.post('/admin/users', formData);
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
        setError(err.response?.data?.error || `Failed to ${editingId ? 'update' : 'create'} user.`);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'patient', phone: '' });
    setEditingId(null);
    setError('');
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Keep empty unless changing
      role: user.role,
      phone: user.phone || ''
    });
    setEditingId(user.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete user.');
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
            User Management
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>
            Overview of clinic staff and patient accounts.
          </p>
        </div>
        <button 
          className="primary" 
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{ padding: '0.8rem 1.5rem', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}
        >
          <Plus size={20} /> Add New User
        </button>
      </div>

      {/* Users Table */}
      <div style={{ 
        background: 'white', 
        borderRadius: '1.25rem', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,1)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
            <p>Gathering user data...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '800px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '1.25rem' }}>Name & Credentials</th>
                  <th>Role</th>
                  <th>Phone Number</th>
                  <th>Registration Date</th>
                  <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.25rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className="badge" style={{ 
                        background: u.role === 'admin' ? '#e0f2fe' : u.role === 'doctor' ? '#dcfce3' : u.role === 'receptionist' ? '#fef3c7' : '#f3f4f6',
                        color: u.role === 'admin' ? '#0369a1' : u.role === 'doctor' ? '#15803d' : u.role === 'receptionist' ? '#b45309' : '#374151',
                        padding: '0.4rem 0.8rem'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-light)' }}>{u.phone || '—'}</td>
                    <td style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                      {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                        <div className="flex justify-end gap-2" style={{ paddingRight: '1rem' }}>
                          <button 
                            className="secondary" 
                            onClick={() => handleEdit(u)}
                            style={{ padding: '0.5rem', borderRadius: '0.5rem' }}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            className="danger" 
                            onClick={() => handleDelete(u.id)}
                            style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#fee2e2', color: '#ef4444' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FIXED MODAL SYSTEM */}
      {showModal && (
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
            onClick={() => setShowModal(false)}
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
            maxWidth: '500px', 
            background: 'white', 
            borderRadius: '1.5rem',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            maxHeight: 'calc(100vh - 3rem)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header - Dark Premium */}
            <div style={{ 
              padding: '2rem', 
              background: '#1e293b', 
              color: 'white',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>{editingId ? 'Update' : 'Create'} User</h2>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{editingId ? 'Modify existing credentials and role.' : 'Fill in all required fields to register a new account.'}</p>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} style={{ padding: '2rem', overflowY: 'auto' }}>
              {error && (
                <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  minLength={3} 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Johnathan Smith"
                  style={{ border: '2px solid #e2e8f0', height: '52px', fontWeight: '500' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ height: '52px', border: '2px solid #e2e8f0' }}>
                    <option value="patient">Patient</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 000-000-0000" style={{ border: '2px solid #e2e8f0', height: '52px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder="john@clinic.com"
                  style={{ border: '2px solid #e2e8f0', height: '52px' }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Password {editingId ? '(leave blank to keep current)' : (<span style={{ color: '#ef4444' }}>*</span>)}
                </label>
                <input 
                  type="password" 
                  required={!editingId} 
                  minLength={6} 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  placeholder={editingId ? '•••••••• (optional)' : '••••••••'}
                  style={{ border: '2px solid #e2e8f0', height: '52px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="secondary" style={{ flex: 1, height: '52px' }}>
                  Cancel
                </button>
                <button type="submit" className="primary" style={{ flex: 2, height: '52px', fontSize: '1rem' }}>
                  {editingId ? 'Update User' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
