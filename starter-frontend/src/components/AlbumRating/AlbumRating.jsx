import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getAlbums, rateAlbum } from '../../services/album';
import './AlbumRating.css';

const StarRating = ({ rating, onRate, interactive }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="star-rating" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hovered || rating) ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          role={interactive ? 'button' : 'presentation'}
          aria-label={interactive ? `Rate ${star} stars` : `${star} stars`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  onRate: PropTypes.func,
  interactive: PropTypes.bool
};

const AlbumRating = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="album-rating-container">
      <h2 className="section-title">Rate Albums</h2>
      <div className="albums-grid">
        {albums.map((album) => (
          <div key={album._id} className="album-card">
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

              <div className="rating-section">
                <div className="average-rating">
                  <span className="rating-number">
                    {album.averageRating > 0 ? album.averageRating.toFixed(1) : '—'}
                  </span>
                  <StarRating rating={Math.round(album.averageRating)} interactive={false} />
                  <span className="rating-count">
                    ({album.totalRatings} {album.totalRatings === 1 ? 'rating' : 'ratings'})
                  </span>
                </div>

                <div className="user-rating-section">
                  <p className="your-rating-label">
                    {album.userRating ? 'Your rating:' : 'Rate this album:'}
                  </p>
                  <StarRating
                    rating={album.userRating || 0}
                    onRate={(score) => !submitting && handleRate(album._id, score)}
                    interactive={!submitting}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumRating;
