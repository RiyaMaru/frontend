import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import DoctorQueue from './pages/doctor/DoctorQueue';
import DailyQueue from './pages/receptionist/DailyQueue';
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyRecords from './pages/patient/MyRecords';

// A simple protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = React.useContext(AuthContext);
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const { user } = React.useContext(AuthContext);

  const getHomeRedirect = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'patient': return '/patient/dashboard';
      case 'receptionist': return '/receptionist/queue';
      case 'doctor': return '/doctor/queue';
      default: return '/login';
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!!user ? <Navigate to={getHomeRedirect()} replace /> : <Login />} />
        
        {/* Protected Dashboard Layout */}
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to={getHomeRedirect()} replace />} />
          
          {/* Admin Routes */}
          <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
          
          {/* Doctor Routes */}
          <Route path="doctor/queue" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorQueue /></ProtectedRoute>} />

          {/* Receptionist Routes */}
          <Route path="receptionist/queue" element={<ProtectedRoute allowedRoles={['receptionist']}><DailyQueue /></ProtectedRoute>} />

          {/* Patient Routes */}
          <Route path="patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="patient/book" element={<ProtectedRoute allowedRoles={['patient']}><BookAppointment /></ProtectedRoute>} />
          <Route path="patient/records" element={<ProtectedRoute allowedRoles={['patient']}><MyRecords /></ProtectedRoute>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
