import axios from 'axios';

axios.defaults.withCredentials = true;

const API = 'http://localhost:3001';

/**
 * Search registered users by username (substring, case-insensitive).
 * Requires an authenticated session.
 */
export async function searchUsers(q) {
  const query = (q || '').trim();
  if (!query) {
    return { success: true, data: [] };
  }
  try {
    const response = await axios.get(`${API}/api/user-search`, {
      params: { q: query }
    });
    return { success: true, data: Array.isArray(response.data) ? response.data : [] };
  } catch (error) {
    const status = error.response?.status;
    if (status === 401) {
      return { success: false, error: 'Please sign in to search users.', data: [] };
    }
    const msg = error.response?.data?.error || error.message || 'Search failed';
    return { success: false, error: msg, data: [] };
  }
}
