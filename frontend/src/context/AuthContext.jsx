import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Register new user
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.register(userData);
      
      if (response.success) {
        // Auto-login after registration
        const loginResponse = await authAPI.login({
          username: userData.username,
          password: userData.password,
        });
        
        if (loginResponse.success) {
          // Handle both old and new token response formats
          const token = loginResponse.data.tokens?.accessToken || loginResponse.data.token;
          const { client } = loginResponse.data;
          setToken(token);
          setUser(client);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(client));
          return { success: true, data: client };
        } else {
          // Login failed after registration
          const errorMessage = loginResponse.error?.message || 'Auto-login failed after registration';
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }
      }
      
      return response;
    } catch (err) {
      // Handle different error formats
      let errorResponse;
      
      if (err.error) {
        // API returned structured error
        errorResponse = err.error;
      } else if (err.message) {
        // Simple error message
        errorResponse = err.message;
      } else {
        // Unknown error format
        errorResponse = 'Registration failed';
      }
      
      setError(typeof errorResponse === 'string' ? errorResponse : errorResponse.message);
      return { success: false, error: errorResponse };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        // Handle both old and new token response formats
        const token = response.data.tokens?.accessToken || response.data.token;
        const { client, isAdmin } = response.data;
        setToken(token);
        setUser(client);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(client));
        return { success: true, data: { ...client, isAdmin } };
      }
      
      return response;
    } catch (err) {
      console.error('Login error in AuthContext:', err);
      let errorMessage = 'Login failed';
      
      // Handle different error formats
      if (err.error?.message) {
        errorMessage = err.error.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Check if it's a network/server error
      if (errorMessage.toLowerCase().includes('network') || 
          errorMessage.toLowerCase().includes('fetch') ||
          errorMessage.toLowerCase().includes('server')) {
        errorMessage = 'Unable to connect to server. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.updateProfile(updates);
      
      if (response.success) {
        const updatedUser = response.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, data: updatedUser };
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.error?.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get fresh profile data
  const refreshProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      
      if (response.success) {
        const updatedUser = response.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, data: updatedUser };
      }
      
      return response;
    } catch (err) {
      return { success: false, error: err.error?.message || 'Failed to refresh profile' };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.is_admin === 1 || user?.is_admin === true;
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    refreshProfile,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
