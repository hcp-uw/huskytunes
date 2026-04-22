import axios from 'axios'
import { searchUsers } from './users'

const API = 'http://localhost:3001'
const baseURL = `${API}/api/albums`

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
const rateAlbum = async (albumId, score, review = '', albumData = null) => {
  try {
    console.log('Frontend rateAlbum calling backend for ID:', albumId);
    const response = await axios.post(`${baseURL}/${albumId}/rate`, { 
      score, 
      review,
      albumData // Send full data in case it needs to be created in DB
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Rating error details:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to submit rating'
    };
  }
};

// Search Spotify (albums only; legacy)
const searchSpotify = async (query) => {
  try {
    const response = await axios.get(`${API}/api/spotify/search`, { params: { q: query } });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Search error details:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to search Spotify'
    };
  }
};

/**
 * Unified search: albums (Spotify + local ratings), artists (Spotify), users (friends).
 * @param {{ albums?: boolean, artists?: boolean, users?: boolean }} scope — pass false to skip
 */
const unifiedSearch = async (query, scope = {}) => {
  const q = (query || '').trim();
  if (!q) {
    return { success: true, data: { albums: [], artists: [], users: [] } };
  }

  const wantAlbums = scope.albums !== false;
  const wantArtists = scope.artists !== false;
  const wantUsers = scope.users !== false;

  try {
    const qs = new URLSearchParams({ q });
    const settled = await Promise.allSettled([
      wantAlbums ? axios.get(`${API}/api/spotify/search?${qs.toString()}`) : Promise.resolve({ data: [] }),
      wantArtists ? axios.get(`${API}/api/spotify/artists/search?${qs.toString()}`) : Promise.resolve({ data: [] }),
      wantUsers ? searchUsers(q) : Promise.resolve({ success: true, data: [] })
    ]);

    const albumsRes = settled[0];
    const artistsRes = settled[1];
    const usersRes = settled[2];

    const albums =
      albumsRes.status === 'fulfilled' && Array.isArray(albumsRes.value.data) ? albumsRes.value.data : [];
    const artists =
      artistsRes.status === 'fulfilled' && Array.isArray(artistsRes.value.data) ? artistsRes.value.data : [];
    const users =
      usersRes.status === 'fulfilled' && usersRes.value.success && Array.isArray(usersRes.value.data)
        ? usersRes.value.data
        : [];

    return { success: true, data: { albums, artists, users } };
  } catch (error) {
    console.error('Unified search error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || 'Search failed',
      data: { albums: [], artists: [], users: [] }
    };
  }
};

// Delete a rating
const deleteRating = async (albumId) => {
  try {
    const response = await axios.delete(`${baseURL}/${albumId}/rate`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to delete rating'
    };
  }
};

export { getAlbums, getAlbum, rateAlbum, searchSpotify, unifiedSearch, deleteRating };
