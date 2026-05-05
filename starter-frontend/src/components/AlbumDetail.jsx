import React, { useState, useEffect } from 'react';
import { rateAlbum, getAlbum, deleteRating, getAlbumTracks, rateSong } from '../services/album';

const formatDuration = (ms) => {
  const total = Math.floor(ms / 1000);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

const StarRating = ({ value, onChange, disabled }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={disabled}
        onClick={() => onChange(star)}
        className={`text-lg transition-all leading-none ${
          disabled ? 'cursor-default' : 'hover:scale-110 cursor-pointer'
        } ${star <= value ? 'text-yellow-400' : 'text-gray-200'}`}
      >
        ★
      </button>
    ))}
  </div>
);

const AlbumDetail = ({ album: initialAlbum, user, onBack, backText = 'back to community' }) => {
  const [album, setAlbum] = useState(initialAlbum);
  const [rating, setRating] = useState(album.userRating || 0);
  const [review, setReview] = useState(album.review || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(!album.userRating);
  const [tracks, setTracks] = useState([]);
  const [songRatings, setSongRatings] = useState({});
  const [avgSongRatings, setAvgSongRatings] = useState({});
  const [submittingSong, setSubmittingSong] = useState(null);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [tracksError, setTracksError] = useState(null);

  useEffect(() => {
    const fetchFullDetails = async () => {
      const id = album._id || album.spotifyId;
      const result = await getAlbum(id);
      if (result.success) {
        setAlbum(result.data);
        setRating(result.data.userRating || 0);
        setReview(result.data.review || '');
        setIsEditing(!result.data.userRating);
      }
    };
    fetchFullDetails();
  }, []);

  useEffect(() => {
    const spotifyId = album.spotifyId;
    if (!spotifyId) return;
  
    const fetchTracks = async () => {
      setTracksLoading(true);
      setTracksError(null);
      const result = await getAlbumTracks(spotifyId);
      if (result.success) {
        setTracks(result.data.tracks || []);
        setSongRatings(result.data.userSongRatings || {});
      } else {
        setTracksError('Could not load tracklist.');
      }
      setTracksLoading(false);
    };
    fetchTracks();
  }, [album.spotifyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || rating === 0) {
      setError("Please select a rating before submitting.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    const result = await rateAlbum(
      album.spotifyId || album._id, 
      rating, 
      review,
      album // Pass full album data to ensure it's in DB
    );
    
    if (result.success) {
      setSuccess(true);
      setAlbum(prev => ({
        ...prev,
        averageRating: result.data.averageRating,
        totalRatings: result.data.totalRatings,
        userRating: rating,
        review: review,
        // Update the ratings list locally to show the new review
        ratings: [
          ...(prev.ratings || []).filter(r => !r.isMine),
          {
            username: user.username,
            score: rating,
            review: review,
            updatedAt: new Date(),
            isMine: true
          }
        ]
      }));
      setIsEditing(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!user || !window.confirm("Are you sure you want to delete your rating and review?")) return;
    
    setIsSubmitting(true);
    setError(null);
    
    const id = album._id || album.spotifyId;
    const result = await deleteRating(id);
    
    if (result.success) {
      setAlbum(prev => ({
        ...prev,
        averageRating: result.data.averageRating,
        totalRatings: result.data.totalRatings,
        userRating: null,
        review: null,
        ratings: (prev.ratings || []).filter(r => !r.isMine)
      }));
      setRating(0);
      setReview('');
      setIsEditing(true);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error);
    }
    setIsSubmitting(false);
  };

  const handleSongRating = async (trackId, score) => {
    if (!user) return;
    setSongRatings(prev => ({ ...prev, [trackId]: score }));
    setSubmittingSong(trackId);
    const result = await rateSong(album.spotifyId, trackId, score, album);
    if (result.success) {
      setAvgSongRatings(prev => ({
        ...prev,
        [trackId]: {
          average: result.data.averageRating,
          total: result.data.totalRatings
        }
      }));
    }
    setSubmittingSong(null);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-6xl mx-auto px-8 pt-12">
        <button 
          onClick={onBack}
          className="mb-8 text-black font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:opacity-60 transition-opacity cursor-pointer"
        >
          ← {backText}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          {/* Left: Album Cover */}
          <div className="md:col-span-5">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
              <img src={album.cover} alt={album.title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Right: Details & Rating */}
          <div className="md:col-span-7 flex flex-col justify-center">
            <h1 className="text-7xl font-black tracking-tighter leading-none mb-4">{album.title}</h1>
            <p className="text-3xl font-serif italic text-gray-400 mb-8">{album.artist} • {album.year}</p>

            <div className="flex flex-col gap-8 mb-12 py-8 border-y border-gray-100">
              <div className="flex items-center gap-12">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-2">average rating</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black">{album.averageRating ? album.averageRating.toFixed(1) : '—'}</span>
                    <span className="text-xl font-bold text-gray-300">/ 10</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{album.totalRatings || 0} community ratings</p>
                </div>
              </div>

              {user && (
                <div className="space-y-4">
                  {!isEditing ? (
                    <div className="bg-husky-purple/5 p-6 rounded-2xl border border-husky-purple/10">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-husky-purple mb-1">your review</p>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-black">{rating}</span>
                            <span className="text-xs font-bold text-husky-purple/40">/ 10</span>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button 
                            onClick={() => setIsEditing(true)}
                            className="text-[10px] uppercase tracking-widest font-black text-husky-purple hover:underline"
                          >
                            edit review
                          </button>
                          <button 
                            onClick={handleDelete}
                            className="text-[10px] uppercase tracking-widest font-black text-red-500 hover:underline"
                          >
                            delete
                          </button>
                        </div>
                      </div>
                      {review && review.trim() && (
                        <p className="text-gray-600 text-sm leading-relaxed italic">
                          "{review}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="flex flex-col gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-2">your rating</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                              <button
                                key={score}
                                type="button"
                                onClick={() => setRating(score)}
                                className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                                  rating === score 
                                    ? 'bg-black text-white scale-110 shadow-lg' 
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-2">your review</p>
                          <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="What did you think of this album?"
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 min-h-[120px] resize-none"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <button
                          type="submit"
                          disabled={isSubmitting || rating === 0}
                          className="px-8 py-3 bg-black text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'submitting...' : 'save rating & review'}
                        </button>
                        {album.userRating && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setRating(album.userRating);
                              setReview(album.review || '');
                            }}
                            className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black"
                          >
                            cancel
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                  
                  {success && (
                    <span className="text-green-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                      saved! 🐾
                    </span>
                  )}
                  
                  {error && (
                    <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">
                      {error}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h3 className="text-xs uppercase tracking-[0.3em] font-black text-black">community reviews</h3>
              <div className="space-y-4">
                {album.ratings && album.ratings.filter(r => r.review && r.review.trim()).length > 0 ? (
                  album.ratings.filter(r => r.review && r.review.trim()).map((r, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-husky-purple rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                            {r.username.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-sm">{r.username} {r.isMine && "(you)"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-black">{r.score}</span>
                          <span className="text-[10px] font-bold text-gray-300">/ 10</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {r.review || "No written review."}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-wider font-bold">
                        {new Date(r.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm font-medium italic">No reviews yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Tracklist */}
        <div className="mt-20">
          <h3 className="text-xs uppercase tracking-[0.3em] font-black text-black mb-6">tracklist</h3>

          {tracksLoading && (
            <p className="text-sm text-gray-400 italic">Loading tracks…</p>
          )}
          {tracksError && (
            <p className="text-sm text-red-400">{tracksError}</p>
          )}

          {!tracksLoading && !tracksError && tracks.length > 0 && (
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
              {tracks.map((track, index) => {
                const userScore = songRatings[track.id] || 0;
                const avg = avgSongRatings[track.id];
                const isSaving = submittingSong === track.id;
                return (
                  <div key={track.id} className="flex items-center gap-4 px-6 py-4 bg-white hover:bg-gray-50 transition-colors group">
                    <span className="text-xs font-bold text-gray-300 w-5 text-right shrink-0">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{track.name}</p>
                      {track.artists && track.artists.length > 0 && (
                        <p className="text-xs text-gray-400 truncate">{track.artists.map(a => a.name).join(', ')}</p>
                      )}
                    </div>
                    {user ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <StarRating value={userScore} onChange={(score) => handleSongRating(track.id, score)} disabled={isSaving} />
                        {isSaving && <span className="text-[10px] text-gray-400 uppercase tracking-widest">saving…</span>}
                        {avg && !isSaving && <span className="text-[10px] text-gray-400 font-bold ml-1">{avg.average}★ ({avg.total})</span>}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-300 uppercase tracking-widest shrink-0">log in to rate</span>
                    )}
                    <span className="text-xs text-gray-400 font-mono shrink-0 ml-2">{formatDuration(track.duration_ms)}</span>
                  </div>
                );
              })}
            </div>
          )}

          {!tracksLoading && !tracksError && tracks.length === 0 && (
            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm font-medium italic">No tracks found for this album.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlbumDetail;
