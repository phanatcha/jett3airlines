import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const loginResponse = await authAPI.login({
          username: userData.username,
          password: userData.password,
        });
        
        if (loginResponse.success) {
          const token = loginResponse.data.tokens?.accessToken || loginResponse.data.token;
          const { client } = loginResponse.data;
          setToken(token);
          setUser(client);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(client));
          return { success: true, data: client };
        } else {
          const errorMessage = loginResponse.error?.message || 'Auto-login failed after registration';
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }
      }
      
      return response;
    } catch (err) {
      let errorResponse;
      
      if (err.error) {
        errorResponse = err.error;
      } else if (err.message) {
        errorResponse = err.message;
      } else {
        errorResponse = 'Registration failed';
      }
      
      setError(typeof errorResponse === 'string' ? errorResponse : errorResponse.message);
      return { success: false, error: errorResponse };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.login(credentials);
      
      if (response.success) {
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
      
      if (err.error?.message) {
        errorMessage = err.error.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
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


  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('searchCriteria');
    localStorage.removeItem('selectedFlights');
    localStorage.removeItem('passengers');
    localStorage.removeItem('selectedSeats');
    localStorage.removeItem('fareOptions');
    localStorage.removeItem('paymentConfirmation');
  };


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


  const isAuthenticated = () => {
    return !!token && !!user;
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
