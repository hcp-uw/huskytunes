import axios from 'axios'

const baseURL = 'http://localhost:3001/api/auth'

// Configure axios to send credentials (cookies) with requests
axios.defaults.withCredentials = true;

// Register a new user
const register = async (username, password) => {
  try {
    const response = await axios.post(`${baseURL}/register`, {
      username,
      password
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Registration error:', error);
    // Handle network errors (no response from server)
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        return { 
          success: false, 
          error: 'Cannot connect to server. Make sure the backend is running on port 3001.'
        };
      }
      return { 
        success: false, 
        error: error.message || 'Network error. Please check your connection.'
      };
    }
    // Handle HTTP errors (server responded with error status)
    const errorMessage = error.response?.data?.error || 'Registration failed';
    return { 
      success: false, 
      error: errorMessage
    };
  }
};

// Login user
const login = async (username, password) => {
  try {
    const response = await axios.post(`${baseURL}/login`, {
      username,
      password
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Login failed' 
    };
  }
};

// Logout user
const logout = async () => {
  try {
    const response = await axios.post(`${baseURL}/logout`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Logout failed' 
    };
  }
};

// Get current user
const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${baseURL}/me`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Not authenticated' 
    };
  }
};

export { register, login, logout, getCurrentUser };
