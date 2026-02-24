/**
 * Centralized Authentication & Session Management
 * Handles token validation, expiration, and automatic logout
 */

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  SESSION_DATA: 'CurrentSessionData',
  TOKEN_EXPIRY: 'token_expiry',
};

// Token expiry check interval (5 minutes)
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000;

class AuthService {
  constructor() {
    this.isLoggingOut = false;
    this.listeners = new Set();
    this.checkInterval = null;
  }

  // Get current access token
  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  // Get current session data
  getSessionData() {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION_DATA) || '{}');
    } catch (e) {
      console.error('Failed to parse session data:', e);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    return !!token && !this.isLoggingOut;
  }

  // Get user info from session
  getUser() {
    const session = this.getSessionData();
    return session?.user || null;
  }

  // Subscribe to auth state changes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.isAuthenticated()));
  }

  // Start periodic token validation
  startTokenCheck() {
    if (this.checkInterval) return;
    
    this.checkInterval = setInterval(() => {
      if (this.isAuthenticated()) {
        this.validateToken();
      }
    }, TOKEN_CHECK_INTERVAL);
  }

  // Stop periodic token validation
  stopTokenCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Validate token with server
  async validateToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await this.handleTokenExpired();
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  // Handle token expiration
  async handleTokenExpired(message = 'Your session has expired. Please login again.') {
    if (this.isLoggingOut) return;
    
    this.isLoggingOut = true;
    
    try {
      // Show notification
      toast.error(message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Clear all storage
      this.clearAuth();

      // Redirect to login after a short delay
      setTimeout(() => {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
        window.location.href = `/signin?redirect=${encodeURIComponent(currentPath)}`;
      }, 1000);

    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.isLoggingOut = false;
    }
  }

  // Clear all authentication data
  clearAuth() {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.SESSION_DATA);
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
      this.stopTokenCheck();
      this.notifyListeners();
    } catch (e) {
      console.error('Error clearing auth data:', e);
    }
  }

  // Manual logout
  async logout(redirect = true) {
    const token = this.getToken();
    
    try {
      // Call logout endpoint to invalidate token on server
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
      
      if (redirect) {
        window.location.href = '/signin';
      }
    }
  }

  // Check HTTP status and handle auth errors
  handleResponseStatus(response) {
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Don't handle if already logging out
        if (!this.isLoggingOut) {
          this.handleTokenExpired();
        }
        return false;
      }
    }
    return true;
  }
}

// Export singleton instance
export const authService = new AuthService();

// Enhanced xFetch with auth handling
export async function xFetch({
  method = 'GET',
  path = '',
  payload = null,
  isFormData = false,
  responseType = 'json',
  skipAuthCheck = false, // Option to skip auth check for specific calls
}) {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('access_token');

    // Check if token exists (unless skipped)
    if (!token && !skipAuthCheck) {
      console.warn('No access token found');
      authService.handleTokenExpired('No authentication token found. Please login.');
      reject(new Error('No authentication token'));
      return;
    }

    const myHeaders = new Headers();
    if (!isFormData) {
      myHeaders.append("Content-Type", "application/json");
    }
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = { method, headers: myHeaders, redirect: "follow" };

    if (payload) {
      if (method !== 'GET') {
        if (isFormData) {
          requestOptions['body'] = payload;
        } else {
          requestOptions['body'] = JSON.stringify(payload);
        }
      } else {
        const jsonToQueryParams = (json) => {
          return Object.keys(json)
            .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(json[key]))
            .join("&");
        };
        path = `${path}?${jsonToQueryParams(payload)}`;
      }
    }

    fetch(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}${path}`, requestOptions)
      .then(async response => {
        // Handle auth errors
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            if (!skipAuthCheck && !authService.isLoggingOut) {
              await authService.handleTokenExpired('Your session has expired. Please login again.');
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          // For other errors, still throw but don't logout
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        if (responseType === 'blob') {
          return await response.blob();
        }
        if (responseType === 'arrayBuffer') {
          return await response.arrayBuffer();
        }
        if (responseType === 'text') {
          return await response.text();
        }

        // default: JSON
        const text = await response.text();
        if (!text) return {};
        try {
          return JSON.parse(text);
        } catch (err) {
          console.error("Failed to parse JSON response:", text);
          throw new Error(`Invalid JSON response: ${err.message}`);
        }
      })
      .then(result => resolve(result))
      .catch(error => {
        // Network errors or other issues
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          console.error('Network error:', error);
          toast.error('Network error. Please check your connection.');
        }
        reject(error);
      });
  });
}

// Export xDownload with auth handling
export async function xDownload(nextTarget, duration = 10000) {
  if (typeof window === 'undefined') return;

  const token = localStorage.getItem('access_token');
  if (!token) {
    console.warn('access_token not found in localStorage');
    authService.handleTokenExpired('No authentication token found. Please login.');
    return;
  }

  const popup = window.open('', '_blank');
  if (!popup) {
    console.warn('Popup blocked by browser');
    return;
  }

  // Build the form in the new window
  const doc = popup.document;

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/leadstor/dashboard`;

  const tokenInput = document.createElement('input');
  tokenInput.type = 'hidden';
  tokenInput.name = 'token';
  tokenInput.value = token;

  const nextTargetInput = document.createElement('input');
  nextTargetInput.type = 'hidden';
  nextTargetInput.name = 'nextTarget';
  nextTargetInput.value = nextTarget;

  form.appendChild(tokenInput);
  form.appendChild(nextTargetInput);

  doc.body.appendChild(form);
  form.submit();

  // Close the window after a delay
  setTimeout(() => {
    popup.close();
  }, duration);
}

// React Hook for auth state
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initial check
    setIsAuthenticated(authService.isAuthenticated());

    // Subscribe to changes
    const unsubscribe = authService.subscribe(setIsAuthenticated);

    // Start token check
    authService.startTokenCheck();

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isAuthenticated,
    user: authService.getUser(),
    logout: () => authService.logout(),
  };
}

// Initialize auth check on module load (client-side only)
if (typeof window !== 'undefined') {
  // Start periodic token validation
  authService.startTokenCheck();
}
