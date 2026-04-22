import React, { useCallback, useEffect, useState } from 'react';
import { unifiedSearch } from '../services/album';
import DefaultUserAvatar from './DefaultUserAvatar';

const SearchResultCard = ({ album, onClick }) => {
  return (
    <div 
      onClick={() => onClick(album)}
      className="group flex items-center gap-8 p-6 bg-white rounded-3xl border border-gray-100 hover:border-husky-purple/20 hover:shadow-xl hover:shadow-husky-purple/5 transition-all cursor-pointer"
    >
      <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg">
        <img src={album.cover} alt={album.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-3xl font-black tracking-tighter truncate mb-1">{album.title}</h3>
        <p className="text-xl font-serif italic text-gray-400">{album.artist} • {album.year}</p>
      </div>

      <div className="flex flex-col items-end gap-2 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-xl">★</span>
          <span className="text-2xl font-black">{album.averageRating ? album.averageRating.toFixed(1) : '—'}</span>
        </div>
        <p className="text-[10px] uppercase tracking-widest font-black text-gray-300">avg rating</p>
      </div>
    </div>
  );
};

const ArtistResultCard = ({ artist }) => {
  const open = () => {
    if (artist.externalUrl) {
      window.open(artist.externalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button
      type="button"
      onClick={open}
      disabled={!artist.externalUrl}
      className="group w-full text-left flex items-center gap-8 p-6 bg-white rounded-3xl border border-gray-100 hover:border-husky-purple/20 hover:shadow-xl hover:shadow-husky-purple/5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
        {artist.image ? (
          <img
            src={artist.image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-5xl text-gray-300" aria-hidden>
            ♪
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-3xl font-black tracking-tighter truncate mb-1">{artist.name}</h3>
        <p className="text-xl font-serif italic text-gray-400">
          {artist.genres && artist.genres.length > 0 ? artist.genres.join(' • ') : 'artist'}
        </p>
      </div>

      <div className="flex flex-col items-end pr-2">
        <span className="text-[10px] uppercase tracking-widest font-black text-gray-300">spotify</span>
      </div>
    </button>
  );
};

const FilterPill = ({ label, active, disabled, onToggle }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onToggle}
    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
      disabled
        ? 'opacity-40 cursor-not-allowed border border-gray-100 text-gray-400'
        : active
          ? 'bg-black text-white'
          : 'border border-gray-200 text-gray-600 hover:border-gray-300'
    }`}
  >
    {label}
  </button>
);

const SearchResults = ({ query, user, onAlbumClick, onBack }) => {
  const [filters, setFilters] = useState({ albums: true, artists: true, friends: true });
  const [data, setData] = useState({ albums: [], artists: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requested, setRequested] = useState(() => new Set());

  const sendRequest = useCallback((id) => {
    setRequested((prev) => new Set(prev).add(id));
  }, []);

  useEffect(() => {
    if (!user) {
      setFilters((f) => (f.friends ? { ...f, friends: false } : f));
    }
  }, [user]);

  useEffect(() => {
    const q = (query || '').trim();
    if (!q) {
      setData({ albums: [], artists: [], users: [] });
      setError('');
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      setData({ albums: [], artists: [], users: [] });
      const res = await unifiedSearch(q, {
        albums: filters.albums,
        artists: filters.artists,
        users: user ? filters.friends : false
      });
      if (cancelled) return;
      if (res.success && res.data) {
        setData({
          albums: res.data.albums || [],
          artists: res.data.artists || [],
          users: res.data.users || []
        });
      } else {
        setData({ albums: [], artists: [], users: [] });
        setError(res.error || 'Search failed');
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [query, filters.albums, filters.artists, filters.friends, user]);

  const toggle = (key) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const countOn =
        (next.albums ? 1 : 0) + (next.artists ? 1 : 0) + (user && next.friends ? 1 : 0);
      if (countOn === 0) return prev;
      return next;
    });
  };

  const visibleAlbums = filters.albums ? data.albums : [];
  const visibleArtists = filters.artists ? data.artists : [];
  const visibleUsers = user && filters.friends ? data.users : [];
  const totalHits = visibleAlbums.length + visibleArtists.length + visibleUsers.length;
  const qTrim = (query || '').trim();

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="h-20 bg-black" aria-hidden />

      <div className="max-w-4xl mx-auto px-8 pt-12">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 text-black font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:opacity-60 transition-opacity"
        >
          ← back to home
        </button>

        <div className="mb-8">
          <h2 className="text-5xl font-black tracking-tighter mb-2 text-black leading-tight">
            {qTrim ? `results for "${query}"` : 'search'}
          </h2>
          <p className="text-gray-400 text-lg font-light">
            {loading ? 'searching…' : error ? error : qTrim ? `found ${totalHits} result${totalHits === 1 ? '' : 's'}` : ''}
          </p>
        </div>

        {qTrim && (
          <div className="flex flex-wrap gap-2 mb-10">
            <FilterPill label="albums" active={filters.albums} onToggle={() => toggle('albums')} />
            <FilterPill label="artists" active={filters.artists} onToggle={() => toggle('artists')} />
            <FilterPill
              label="friends"
              active={filters.friends}
              disabled={!user}
              onToggle={() => user && toggle('friends')}
            />
          </div>
        )}

        {!qTrim && (
          <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-gray-400 font-medium italic max-w-md mx-auto">
              Type a query in the header, then press <span className="font-bold not-italic text-gray-500">go</span> to see
              results here.
            </p>
          </div>
        )}

        {qTrim && !loading && !error && totalHits === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-gray-400 font-medium italic">Nothing matched. Try another query or adjust filters.</p>
          </div>
        )}

        {qTrim && !loading && !error && totalHits > 0 && (
          <div className="flex flex-col gap-12">
            {visibleAlbums.length > 0 && (
              <section>
                <h3 className="text-xs uppercase tracking-[0.3em] font-black text-gray-400 mb-4">albums</h3>
                <div className="flex flex-col gap-6">
                  {visibleAlbums.map((album) => (
                    <SearchResultCard
                      key={album.spotifyId || album._id || album.id}
                      album={album}
                      onClick={onAlbumClick}
                    />
                  ))}
                </div>
              </section>
            )}

            {visibleArtists.length > 0 && (
              <section>
                <h3 className="text-xs uppercase tracking-[0.3em] font-black text-gray-400 mb-4">artists</h3>
                <div className="flex flex-col gap-6">
                  {visibleArtists.map((artist) => (
                    <ArtistResultCard key={artist.spotifyId} artist={artist} />
                  ))}
                </div>
              </section>
            )}

            {visibleUsers.length > 0 && (
              <section>
                <h3 className="text-xs uppercase tracking-[0.3em] font-black text-gray-400 mb-4">people</h3>
                <ul className="flex flex-col gap-6">
                  {visibleUsers.map((u) => (
                    <li key={u.id}>
                      <article className="group flex items-center gap-8 p-6 bg-white rounded-3xl border border-gray-100 hover:border-husky-purple/20 hover:shadow-xl hover:shadow-husky-purple/5 transition-all">
                        <div className="w-24 h-24 flex-shrink-0 rounded-full overflow-hidden shadow-lg ring-1 ring-black/5 bg-[#E4E6EB]">
                          <DefaultUserAvatar className="block h-full w-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-3xl font-black tracking-tighter truncate text-black">{u.username}</h3>
                        </div>
                        <button
                          type="button"
                          disabled={requested.has(u.id)}
                          onClick={() => sendRequest(u.id)}
                          className={`shrink-0 px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all disabled:cursor-default ${
                            requested.has(u.id)
                              ? 'bg-gray-100 text-gray-500 border border-gray-200'
                              : 'bg-black text-white hover:bg-gray-900'
                          }`}
                        >
                          {requested.has(u.id) ? 'Request sent' : 'Add friend'}
                        </button>
                      </article>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
