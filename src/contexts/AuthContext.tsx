import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_verified: boolean;
  phone?: string;
  profile_picture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authService.getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      toast.success('Login successful!');
    } catch (error: any) {
      console.error('AuthContext login error:', error);
      const errorMessage = error?.response?.data?.detail || 
                           error?.message || 
                           error?.detail || 
                           'Login failed';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Login failed');
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      await authService.register(userData);
      toast.success('Registration successful! Please check your email to verify your account.');
    } catch (error: any) {
      console.error('AuthContext register error:', error);
      const errorMessage = error?.response?.data?.detail || 
                           error?.message || 
                           error?.detail || 
                           'Registration failed';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshToken = async () => {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      if (refresh_token) {
        const response = await authService.refreshToken(refresh_token);
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
      }
    } catch (error) {
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
