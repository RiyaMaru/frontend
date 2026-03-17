import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LogOut, Home, Users, List, Calendar, FileText, Activity } from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: <Home size={18} /> },
      { name: 'Manage Users', path: '/admin/users', icon: <Users size={18} /> },
    ],
    doctor: [
      { name: "Today's Queue", path: '/doctor/queue', icon: <List size={18} /> }
    ],
    receptionist: [
      { name: 'Daily Queue', path: '/receptionist/queue', icon: <List size={18} /> }
    ],
    patient: [
      { name: 'My Dashboard', path: '/patient/dashboard', icon: <Home size={18} /> },
      { name: 'Book Appointment', path: '/patient/book', icon: <Calendar size={18} /> },
      { name: 'My Records', path: '/patient/records', icon: <FileText size={18} /> },
    ]
  };

  const links = user ? menuItems[user.role] || [] : [];

  return (
    <div className="layout-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
           <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem' }}>
            <Activity size={24} color="white" />
           </div>
           <span>ClinicConnect</span>
        </div>
        
        <div className="nav-links">
          {links.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.5 }}>Signed in as</span>
            <span className="user-name">{user?.name}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700' }}>{user?.role?.toUpperCase()}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
