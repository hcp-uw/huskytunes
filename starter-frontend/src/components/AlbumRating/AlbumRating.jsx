import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getAlbums, rateAlbum } from '../../services/album';
import './AlbumRating.css';

const ScoreButtons = ({ value, onChange, disabled }) => {
  const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="rating-buttons">
      {scores.map((score) => (
        <button
          key={score}
          type="button"
          className={`rating-button ${value === score ? 'selected' : ''}`}
          onClick={() => !disabled && onChange(score)}
          disabled={disabled}
        >
          {score}
        </button>
      ))}
    </div>
  );
};

ScoreButtons.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

const AlbumRating = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);

  const fetchAlbums = async () => {
    const result = await getAlbums();
    if (result.success) {
      setAlbums(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleRate = async (albumId, score) => {
    setSubmitting(true);
    const result = await rateAlbum(albumId, score);
    if (result.success) {
      // Update the album in state with the new rating info
      setAlbums((prev) =>
        prev.map((album) =>
          album._id === albumId
            ? {
                ...album,
                averageRating: result.data.averageRating,
                totalRatings: result.data.totalRatings,
                userRating: result.data.userRating
              }
            : album
        )
      );
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="album-rating-container"><p>Loading albums...</p></div>;
  }

  if (error) {
    return <div className="album-rating-container"><p className="album-error">{error}</p></div>;
  }

  if (albums.length === 0) {
    return <div className="album-rating-container"><p>No albums to rate yet.</p></div>;
  }

  const handleAlbumClick = (albumId) => {
    setSelectedAlbumId(albumId);
  };

  const selectedAlbum = selectedAlbumId
    ? albums.find((album) => album._id === selectedAlbumId)
    : null;

  return (
    <div className="album-rating-container">
      {!selectedAlbum && (
        <>
          <h2 className="section-title">Pick an album to rate</h2>
          <div className="albums-grid">
            {albums.map((album) => (
              <button
                key={album._id}
                type="button"
                className="album-card album-card-clickable"
                onClick={() => handleAlbumClick(album._id)}
              >
                <div className="album-cover-wrapper">
                  <img
                    src={album.cover}
                    alt={`${album.title} cover`}
                    className="album-cover"
                  />
                </div>
                <div className="album-info">
                  <h3 className="album-title">{album.title}</h3>
                  <p className="album-artist">{album.artist}</p>
                  <p className="album-meta">{album.year} &middot; {album.genre}</p>
                  <div className="average-rating">
                    <span className="rating-number">
                      {album.averageRating > 0 ? album.averageRating.toFixed(1) : '—'}
                    </span>
                    <div className="rating-details">
                      <span className="rating-scale-label">Avg Rating</span>
                      <span className="rating-count">
                        ({album.totalRatings} {album.totalRatings === 1 ? 'rating' : 'ratings'})
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {selectedAlbum && (
        <div className="selected-album-container">
          <button
            type="button"
            className="back-button"
            onClick={() => setSelectedAlbumId(null)}
          >
            ← Back to albums
          </button>

          <div className="album-detail-card">
            <div className="album-cover-wrapper">
              <img
                src={selectedAlbum.cover}
                alt={`${selectedAlbum.title} cover`}
                className="album-cover"
              />
            </div>
            <div className="album-info">
              <h3 className="album-title">{selectedAlbum.title}</h3>
              <p className="album-artist">{selectedAlbum.artist}</p>
              <p className="album-meta">{selectedAlbum.year} &middot; {selectedAlbum.genre}</p>

              <div className="rating-section">
                <div className="average-rating">
                  <span className="rating-number">
                    {selectedAlbum.averageRating > 0 ? selectedAlbum.averageRating.toFixed(1) : '—'}
                  </span>
                  <div className="rating-details">
                    <span className="rating-scale-label">Average Rating</span>
                    <span className="rating-count">
                      ({selectedAlbum.totalRatings} {selectedAlbum.totalRatings === 1 ? 'rating' : 'ratings'})
                    </span>
                  </div>
                </div>

                <div className="user-rating-section">
                  <p className="your-rating-label">
                    {selectedAlbum.userRating
                      ? `Your rating: ${selectedAlbum.userRating}/10`
                      : 'Click a number to rate (1–10):'}
                  </p>
                  <ScoreButtons
                    value={selectedAlbum.userRating || 0}
                    onChange={(score) => !submitting && handleRate(selectedAlbum._id, score)}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumRating;
