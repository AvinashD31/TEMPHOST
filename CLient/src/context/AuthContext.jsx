import React, { createContext, useState, useContext, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Add debug logging to track auth state
  useEffect(() => {
    console.log('Auth State Updated:', {
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    });
  }, [user]);

  // Updated to work with new storage mechanism
  const checkAuthStatus = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        setUser(null);
        return;
      }

      // First try to get existing userData from localStorage
      const existingUserData = localStorage.getItem('userData');
      const parsedExistingData = existingUserData ? JSON.parse(existingUserData) : null;

      // Decode the JWT token to get user data including role
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded token:', decodedToken);

      // Merge existing data with token data, preferring existing data for certain fields
      const userData = {
        id: decodedToken.id || decodedToken.sub,
        email: decodedToken.email,
        name: parsedExistingData?.name || decodedToken.name, // Preserve existing name
        role: decodedToken.role,
        mobile: parsedExistingData?.mobile || decodedToken.mobile, // Preserve existing mobile
        // Add other non-sensitive fields as needed
      };

      console.log('User data from token:', userData);
      
      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
      setLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setLoading(false);
    }
  };

  // Call checkAuthStatus when component mounts and when token changes
  useEffect(() => {
    checkAuthStatus();
    // Add event listener for storage changes
    window.addEventListener('storage', checkAuthStatus);
    return () => window.removeEventListener('storage', checkAuthStatus);
  }, []);

  const login = async (email, password) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login response:', data);

      // Store sensitive data in sessionStorage
      if (data.token) {
        sessionStorage.setItem('authToken', data.token);
      }
      if (data.razorPayId) {
        sessionStorage.setItem('razorPayId', data.razorPayId);
      }

      // Store non-sensitive user data in localStorage
      const normalizedUser = {
        id: data.user._id || data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role || 'user',
        mobile: data.user.mobile,
        // Add other non-sensitive fields as needed
      };
      
      localStorage.setItem('userData', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      setIsAuthenticated(true);
      setIsAdmin(normalizedUser.role === 'admin');
      
      return { token: data.token, user: normalizedUser };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Login request timed out');
      }
      throw error;
    }
  };

  const logout = () => {
    // Clear both localStorage and sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('razorPayId');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const updateUserProfile = async (userData) => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token || !user) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies in production
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedUser = await response.json();
      const normalizedUser = {
        id: updatedUser._id || updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role || user.role,
        mobile: updatedUser.mobile,
        // Add other non-sensitive fields as needed
      };
      
      setUser(normalizedUser);
      localStorage.setItem('userData', JSON.stringify(normalizedUser));
      return normalizedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUserProfile,
    checkAuthStatus,
    isAuthenticated: !!user && !!sessionStorage.getItem('authToken'),
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};