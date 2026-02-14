const axios = require('axios');

let accessToken = null;
let tokenExpiration = null;

const getSpotifyToken = async () => {
  // Check if we have a valid token
  if (accessToken && tokenExpiration && Date.now() < tokenExpiration) {
    return accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not found in environment variables');
  }

  const authOptions = {
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    params: {
      grant_type: 'client_credentials',
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  try {
    const response = await axios(authOptions);
    accessToken = response.data.access_token;
    // Set expiration (Spotify tokens usually last 1 hour, we'll refresh slightly early)
    tokenExpiration = Date.now() + (response.data.expires_in - 60) * 1000;
    return accessToken;
  } catch (error) {
    console.error('Error fetching Spotify token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Spotify');
  }
};

const searchAlbums = async (query) => {
  const token = await getSpotifyToken();
  
  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: {
        q: query,
        type: 'album',
        limit: 10
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.albums.items.map(album => ({
      spotifyId: album.id,
      title: album.name,
      artist: album.artists.map(a => a.name).join(', '),
      cover: album.images[0]?.url,
      year: album.release_date.split('-')[0],
      genre: 'Music', // Spotify search doesn't return genre directly at this level
      externalUrl: album.external_urls.spotify
    }));
  } catch (error) {
    console.error('Spotify search error:', error.response?.data || error.message);
    throw new Error('Failed to search albums on Spotify');
  }
};

const getAlbumDetails = async (spotifyId) => {
  const token = await getSpotifyToken();
  
  try {
    const response = await axios.get(`https://api.spotify.com/v1/albums/${spotifyId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const album = response.data;
    return {
      spotifyId: album.id,
      title: album.name,
      artist: album.artists.map(a => a.name).join(', '),
      cover: album.images[0]?.url,
      year: album.release_date.split('-')[0],
      genre: album.genres[0] || 'Music',
      externalUrl: album.external_urls.spotify,
      tracks: album.tracks.items.map(track => ({
        name: track.name,
        duration: track.duration_ms,
        previewUrl: track.preview_url
      }))
    };
  } catch (error) {
    console.error('Spotify album details error:', error.response?.data || error.message);
    throw new Error('Failed to fetch album details from Spotify');
  }
};

module.exports = {
  searchAlbums,
  getAlbumDetails
};
