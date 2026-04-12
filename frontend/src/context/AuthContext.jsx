import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../utils/api';

// Step 1: Create the Auth Context
const AuthContext = createContext();

// Step 2: Create AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in when app loads
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const response = await API.get('/users/profile');
      setUser(response.data);
      setError(null);
    } catch (err) {
      setUser(null);
      // Explicitly logout if token is rejected to clear cookies
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await API.post('/users/auth', { email, password });
      setUser(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await API.post('/users', { name, email, password });
      setUser(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await API.post('/users/logout');
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const response = await API.put('/users/profile', profileData);
      setUser(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// Step 3: Create custom hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
