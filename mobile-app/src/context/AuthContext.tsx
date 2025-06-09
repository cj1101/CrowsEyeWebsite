import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription?: {
    plan: string;
    status: string;
    expiresAt: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll use mock authentication
      // In a real app, you'd call your API here
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        avatar: 'https://via.placeholder.com/100',
        subscription: {
          plan: 'pro',
          status: 'active',
          expiresAt: '2024-12-31',
        },
      };

      const mockToken = 'mock-jwt-token-12345';
      
      await AsyncStorage.setItem('authToken', mockToken);
      await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
      
      setUser(mockUser);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // Mock registration
      const mockUser: User = {
        id: '1',
        email,
        name,
        avatar: 'https://via.placeholder.com/100',
        subscription: {
          plan: 'free',
          status: 'active',
          expiresAt: '2024-12-31',
        },
      };

      const mockToken = 'mock-jwt-token-12345';
      
      await AsyncStorage.setItem('authToken', mockToken);
      await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
      
      setUser(mockUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 