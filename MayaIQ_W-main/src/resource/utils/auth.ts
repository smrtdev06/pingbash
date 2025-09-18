import axios from 'axios';
import { SERVER_URL } from '../const/const';
import { TOKEN_KEY, USER_ID_KEY } from '../const/const';

// Function to validate token with backend
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    console.log("🔍 [W] Validating token with backend");
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
      console.log("🔍 [W] Token is valid");
      return true;
    }
    return false;
  } catch (error: any) {
    console.log("🔍 [W] Token validation failed:", error.response?.status);
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log("🔍 [W] Token expired, clearing storage");
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_ID_KEY);
      return false;
    }
    return false;
  }
};

// Function to check if user should remain logged in
export const shouldMaintainSession = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  const userId = localStorage.getItem(USER_ID_KEY);
  
  if (!token || !userId) {
    console.log("🔍 [W] No session data found");
    return false;
  }
  
  // Check if token format is valid (not expired anonymous token)
  if (token.includes('anonuser')) {
    console.log("🔍 [W] Anonymous token found, not maintaining session");
    return false;
  }
  
  console.log("🔍 [W] Session data found, attempting to maintain session");
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
      console.log("🔍 [W] Session restored successfully");
      return true;
    } else {
      console.log("🔍 [W] Session restoration failed - token invalid");
      return false;
    }
  } catch (error) {
    console.error("🔍 [W] Session restoration error:", error);
    return false;
  }
};

// Function to clear session
export const clearSession = () => {
  console.log("🔍 [W] Clearing user session");
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem('anonToken');
  localStorage.removeItem('browser_uuid');
}; 