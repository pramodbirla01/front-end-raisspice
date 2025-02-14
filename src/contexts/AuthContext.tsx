"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { checkAuthStatus, loginCustomer, registerCustomer, logoutCustomer, setToken } from '@/store/slices/customerSlice';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user: any }>;
  logout: () => Promise<{ success: boolean }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false, user: null }),
  logout: async () => ({ success: false }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { currentCustomer, error } = useSelector((state: RootState) => state.customer);

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      dispatch(checkAuthStatus());
    }
    setLoading(false);
  }, [dispatch]);

  const register = async (userData: { 
    full_name: string; 
    email: string; 
    password: string; 
    phone?: string 
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Save token
      Cookies.set('authToken', data.token, { expires: 7 });
      
      // Update Redux store
      dispatch(setToken(data.token));
      
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token
      Cookies.set('authToken', data.token, { expires: 7 });
      
      // Update Redux store
      dispatch(setToken(data.token));
      
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutCustomer()).unwrap();
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  };

  const value = {
    user: currentCustomer,
    loading,
    error,
    login,
    register,
    logout,
    isLoggedIn: () => !!Cookies.get('authToken'),
    getUserDetails: () => currentCustomer
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
