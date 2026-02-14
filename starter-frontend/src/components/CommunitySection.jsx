import React from 'react';

const AlbumCard = ({ album, onClick }) => {
  return (
    <div 
      onClick={() => onClick(album)}
      className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-md transition-all duration-500 cursor-pointer"
    >
      {/* Album Image */}
      <img 
        src={album.cover} 
        alt={album.title} 
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:blur-sm"
      />
      
      {/* Hover Overlay Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="backdrop-blur-md bg-white/10 p-6 rounded-xl border border-white/20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 text-white">
          <p className="text-xl font-bold truncate">{album.title}</p>
          <p className="text-white/80 text-sm font-medium">{album.artist}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-yellow-400">★</span>
            <span className="font-bold">{album.averageRating ? album.averageRating.toFixed(1) : '—'}</span>
            <span className="text-xs opacity-60">avg rating</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommunitySection = ({ albums, onAlbumClick }) => {
  // Take only the first 4 albums for a 2x2 grid
  const displayAlbums = albums.slice(0, 4);

  return (
    <section className="py-20 px-8 max-w-6xl mx-auto">
      <div className="mb-12">
        <h2 className="text-5xl font-black tracking-tighter mb-4 text-black leading-tight">
          most rated on huskytunes
        </h2>
        <p className="text-gray-400 text-lg font-light">
          {displayAlbums.length > 0 
            ? "the albums our community is talking about most" 
            : "no albums have been rated yet. search for an album to be the first!"}
        </p>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {displayAlbums.map((album) => (
          <AlbumCard 
            key={album.spotifyId || album._id || album.id} 
            album={album} 
            onClick={onAlbumClick}
          />
        ))}
      </div>
    </section>
  );
};

export default CommunitySection;
