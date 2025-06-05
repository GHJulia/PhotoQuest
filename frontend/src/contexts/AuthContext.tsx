import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

interface User {
  id: string;
  name: string;
  surname: string;
  username: string;
  email: string;
  avatar_url: string;
  verified: boolean;
  role: string;
  total_score: number;
  stats?: {
    totalChallenges: number;
    completedChallenges: number;
    correctAnswers: number;
    totalPhotosUploaded: number;
    totalLikesReceived: number;
  };
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (data: {
    name: string;
    surname: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserData: (data: Partial<User>) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to update user data both in state and localStorage
  const updateUser = (userData: User | null) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  // Function to update specific user fields
  const updateUserData = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      updateUser(updatedUser);
    }
  };

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get('/profile');
      const userData = response.data;
      
      if (userData && userData.id) {
        updateUser(userData);
      }
    } catch (error: any) {
      console.error('Failed to refresh user data:', error);
      if (error.response?.status === 401 || error.message === 'No token found') {
        updateUser(null);
      }
    }
  };

  // Set up initial auth check and periodic refresh of user data
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          await refreshUser();
        } catch (error) {
          console.error('Failed to initialize auth:', error);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();

    // Set up periodic refresh every 5 minutes
    const refreshInterval = setInterval(refreshUser, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Set up axios interceptor for token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Add response interceptor
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          updateUser(null);
          // Only navigate to login if we're not already there
          if (!window.location.pathname.includes('/login')) {
            navigate('/login', { state: { from: window.location.pathname } });
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  const login = async (identifier: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });
      if (response.data.token) {
        const { token } = response.data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // โหลดข้อมูล user ใหม่ (ถ้ามี API แยกสำหรับดึง user profile)
        await refreshUser();
        navigate('/');
      } else if (response.data.error) {
        throw new Error(response.data.error);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to login. Please try again.';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Invalid credentials. Please check your email/username and password.';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        errorMessage = 'Unable to reach the server. Please check your connection.';
      }
      throw new Error(errorMessage);
    }
  };

  const signup = async (data: {
    name: string;
    surname: string;
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      await api.post('/auth/signup', data);
      // Pass username to login page
      navigate(`/login?username=${data.username}`);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    updateUser(null);
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup,
      logout, 
      refreshUser, 
      updateUserData, 
      isLoading,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
