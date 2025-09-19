import axios from 'axios';
import { SERVER_URL } from '../const/const';
import { TOKEN_KEY, USER_ID_KEY } from '../const/const';

// Function to refresh token
export const refreshToken = async (token: string): Promise<string | null> => {
  try {
    console.log("🔄 [F] Attempting to refresh token");
    const response = await axios.post(
      `${SERVER_URL}/api/auth/refresh-token`,
      {},
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      }
    );
    
    if (response.status === 200 && response.data.token) {
      console.log("🔄 [F] Token refreshed successfully");
      // Update localStorage with new token
      localStorage.setItem(TOKEN_KEY, response.data.token);
      return response.data.token;
    }
    return null;
  } catch (error: any) {
    console.log("🔄 [F] Token refresh failed:", error.response?.status);
    return null;
  }
};

// Function to validate token with backend
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    console.log("🔍 [F] Validating token with backend");
    const response = await axios.post(
      `${SERVER_URL}/api/private/get/myProfile/detail`,
      {},
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      }
    );
    
    if (response.status === 200) {
      console.log("🔍 [F] Token is valid");
      return true;
    }
    return false;
  } catch (error: any) {
    console.log("🔍 [F] Token validation failed:", error.response?.status);
    if (error.response?.status === 401) {
      // Token expired, try to refresh it
      console.log("🔍 [F] Token expired, attempting refresh");
      const newToken = await refreshToken(token);
      if (newToken) {
        console.log("🔍 [F] Token refreshed, validating new token");
        return await validateToken(newToken);
      } else {
        console.log("🔍 [F] Token refresh failed, clearing storage");
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_ID_KEY);
        return false;
      }
    }
    return false;
  }
};

// Function to validate token format before using it
export const validateTokenFormat = (token: string | null): { isValid: boolean; type: 'jwt' | 'anonymous' | 'invalid'; error?: string } => {
  if (!token || token.trim() === '') {
    return { isValid: false, type: 'invalid', error: 'Token is null, undefined, or empty' };
  }

  // Check if it's an anonymous token
  if (token.startsWith('anon')) {
    // Anonymous tokens can have various formats:
    // - anon123 (simple numeric)
    // - anonusergroupnameXXXXXX (with group name and random string)
    // Just check if it starts with 'anon' and has content after it
    const anonContent = token.replace('anon', '');
    if (anonContent && anonContent.length > 0) {
      return { isValid: true, type: 'anonymous' };
    } else {
      return { isValid: false, type: 'invalid', error: 'Invalid anonymous token format - no content after anon prefix' };
    }
  }

  // Check if it's a JWT token (should have 3 parts separated by dots)
  if (token.split('.').length === 3) {
    return { isValid: true, type: 'jwt' };
  }

  return { isValid: false, type: 'invalid', error: 'Token is not a valid JWT or anonymous token format' };
};

// Function to safely get token from localStorage with validation
export const getSafeToken = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const validation = validateTokenFormat(token);
    
    if (!validation.isValid) {
      console.error("❌ [F] Invalid token in localStorage:", validation.error);
      // Clear invalid token
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    
    console.log("✅ [F] Valid token retrieved from localStorage, type:", validation.type);
    return token;
  } catch (error) {
    console.error("❌ [F] Error accessing localStorage:", error);
    return null;
  }
};

// Function to check if user should remain logged in
export const shouldMaintainSession = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  const userId = localStorage.getItem(USER_ID_KEY);
  
  if (!token || !userId) {
    console.log("🔍 [F] No session data found");
    return false;
  }
  
  // Check if token format is valid (not expired anonymous token)
  if (token.includes('anonuser')) {
    console.log("🔍 [F] Anonymous token found, not maintaining session");
    return false;
  }
  
  console.log("🔍 [F] Session data found, attempting to maintain session");
  return true;
};

// Function to restore user session
export const restoreUserSession = async (): Promise<boolean> => {
  if (!shouldMaintainSession()) {
    return false;
  }
  
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  
  try {
    const isValid = await validateToken(token);
    if (isValid) {
      console.log("🔍 [F] Session restored successfully");
      return true;
    } else {
      console.log("🔍 [F] Session restoration failed - token invalid");
      return false;
    }
  } catch (error) {
    console.error("🔍 [F] Session restoration error:", error);
    return false;
  }
};

// Function to clear session
export const clearSession = () => {
  console.log("🔍 [F] Clearing user session");
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem('anonToken');
  localStorage.removeItem('browser_uuid');
};

// Function to start periodic token refresh
export const startTokenRefreshInterval = (): NodeJS.Timeout | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || token.includes('anonuser')) {
    return null;
  }
  
  console.log("🔄 [F] Starting periodic token refresh (every 24 hours)");
  
  // Refresh token every 24 hours (24 * 60 * 60 * 1000 ms)
  const refreshInterval = setInterval(async () => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (currentToken && !currentToken.includes('anonuser')) {
      console.log("🔄 [F] Periodic token refresh triggered");
      const newToken = await refreshToken(currentToken);
      if (!newToken) {
        console.log("🔄 [F] Periodic token refresh failed - user will need to re-login");
        clearInterval(refreshInterval);
      }
    } else {
      console.log("🔄 [F] No valid token found, stopping refresh interval");
      clearInterval(refreshInterval);
    }
  }, 24 * 60 * 60 * 1000); // 24 hours
  
  return refreshInterval;
};

// Function to stop token refresh interval
export const stopTokenRefreshInterval = (intervalId: NodeJS.Timeout | null) => {
  if (intervalId) {
    console.log("🔄 [F] Stopping token refresh interval");
    clearInterval(intervalId);
  }
}; 

// Function to cleanup corrupted tokens on app initialization
export const cleanupCorruptedTokens = (): void => {
  try {
    console.log("🔍 [F] Checking for corrupted tokens in localStorage...");
    
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const validation = validateTokenFormat(token);
      if (!validation.isValid) {
        console.warn("⚠️ [F] Found corrupted token, removing:", validation.error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_ID_KEY);
        localStorage.removeItem('anonToken');
        localStorage.removeItem('browser_uuid');
        console.log("✅ [F] Corrupted tokens cleaned up");
      } else {
        console.log("✅ [F] Token validation passed, type:", validation.type);
      }
    } else {
      console.log("🔍 [F] No token found in localStorage");
    }
  } catch (error) {
    console.error("❌ [F] Error during token cleanup:", error);
    // If there's any error, clear all auth-related data to be safe
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem('anonToken');
    localStorage.removeItem('browser_uuid');
  }
}; 