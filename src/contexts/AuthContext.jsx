import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        logout();
      }
    } else {
        if (!token) {
            logout();
        }
    }
    setLoading(false);
  }, [token]);

  const login = (userData, jwtToken) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const loginWithToken = (jwtToken) => {
    const payload = decodeJWT(jwtToken);
    if (payload) {
      const userData = {
        id: payload.userId,
        role: payload.role,
        clinicId: payload.clinicId,
        email: 'manual-login@clinic.com'
      };
      login(userData, jwtToken);
      return userData;
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithToken, logout, loading }}>
        {!loading && children}
    </AuthContext.Provider>
  );
};
