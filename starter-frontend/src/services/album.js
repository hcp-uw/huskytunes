import axios from 'axios'

const baseURL = 'http://localhost:3001/api/albums'

// Configure axios to send credentials (cookies) with requests
axios.defaults.withCredentials = true;

// Get all albums
const getAlbums = async () => {
  try {
    const response = await axios.get(baseURL);
    return { success: true, data: response.data };
  } catch (error) {
    if (!error.response) {
      return {
        success: false,
        error: 'Could not reach server. Is the backend running on port 3001?'
      };
    }
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch albums'
    };
  }
};

// Get a single album with its ratings
const getAlbum = async (albumId) => {
  try {
    const response = await axios.get(`${baseURL}/${albumId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch album'
    };
  }
};

// Rate an album (1-5 stars)
const rateAlbum = async (albumId, score) => {
  try {
    const response = await axios.post(`${baseURL}/${albumId}/rate`, { score });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to submit rating'
    };
  }
};

export { getAlbums, getAlbum, rateAlbum };
