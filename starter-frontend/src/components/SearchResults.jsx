import React from 'react';

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

const SearchResults = ({ albums, query, onAlbumClick, onBack }) => {
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="h-20 bg-black"></div>
      
      <div className="max-w-4xl mx-auto px-8 pt-12">
        <button 
          onClick={onBack}
          className="mb-8 text-black font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:opacity-60 transition-opacity"
        >
          ← back to home
        </button>

        <div className="mb-12">
          <h2 className="text-5xl font-black tracking-tighter mb-2 text-black leading-tight">
            results for "{query}"
          </h2>
          <p className="text-gray-400 text-lg font-light">
            found {albums.length} albums
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {albums.map((album) => (
            <SearchResultCard 
              key={album.spotifyId || album._id || album.id} 
              album={album} 
              onClick={onAlbumClick}
            />
          ))}
          
          {albums.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
              <p className="text-gray-400 font-medium italic">No albums found. Try a different search!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
