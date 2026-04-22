import { useState } from "react";

// ── Placeholder image helpers (colored blocks with text) ──────────────────────
function AlbumArt({ label, size = 120, round = false }) {
  const colors = [
    "#6970E6","#2b3194","#e66969","#69c9e6","#e6c969","#a069e6","#69e6a0","#e669c9",
  ];
  const hash = [...label].reduce((a, c) => a + c.charCodeAt(0), 0);
  const bg = colors[hash % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: round ? "50%" : 12,
        background: `linear-gradient(135deg, ${bg}cc, ${bg}66)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.13,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        border: "2px solid rgba(255,255,255,0.15)",
        userSelect: "none",
        letterSpacing: "0.02em",
      }}
    >
      {label.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const TOP_SONGS = [
  { id: 1, title: "Espresso", artist: "Sabrina Carpenter", plays: "1.2k" },
  { id: 2, title: "Not Like Us", artist: "Kendrick Lamar", plays: "980" },
  { id: 3, title: "Die With A Smile", artist: "Bruno Mars", plays: "870" },
  { id: 4, title: "Boys Don't Cry", artist: "The Cure", plays: "740" },
  { id: 5, title: "Ophelia", artist: "The Lumineers", plays: "630" },
  { id: 6, title: "Redbone", artist: "Childish Gambino", plays: "590" },
];

const TOP_ALBUMS = [
  { id: 1, title: "Short n' Sweet", artist: "Sabrina Carpenter" },
  { id: 2, title: "GNX", artist: "Kendrick Lamar" },
  { id: 3, title: "Ophelia", artist: "The Lumineers" },
  { id: 4, title: "Boys Don't Cry", artist: "The Cure" },
  { id: 5, title: "BSHIT", artist: "Various" },
  { id: 6, title: "Awaken My Love", artist: "Childish Gambino" },
];

const TOP_ARTISTS = [
  { id: 1, name: "Sabrina Carpenter" },
  { id: 2, name: "Kendrick Lamar" },
  { id: 3, name: "Bruno Mars" },
  { id: 4, name: "The Lumineers" },
  { id: 5, name: "The Cure" },
  { id: 6, name: "Childish Gambino" },
];

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <h2
        style={{
          fontFamily: "'Corben', serif",
          fontWeight: 700,
          fontSize: 22,
          color: "#1a1a2e",
          margin: 0,
          letterSpacing: "-0.01em",
        }}
      >
        {children}
      </h2>
      <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg, #6970E6 0%, transparent 100%)", borderRadius: 2 }} />
    </div>
  );
}

// ── Top Songs row ─────────────────────────────────────────────────────────────
function TopSongs() {
  const [hoveredId, setHoveredId] = useState(null);
  return (
    <div>
      <SectionHeading>Top Songs</SectionHeading>
      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
        {TOP_SONGS.map((song) => (
          <div
            key={song.id}
            onMouseEnter={() => setHoveredId(song.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              transition: "transform 0.2s ease",
              transform: hoveredId === song.id ? "translateY(-6px)" : "translateY(0)",
              flexShrink: 0,
            }}
          >
            <div style={{ position: "relative" }}>
              <AlbumArt label={song.title} size={110} />
              {hoveredId === song.id && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 12,
                    background: "rgba(105,112,230,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}
                >
                  ▶
                </div>
              )}
            </div>
            <div style={{ textAlign: "center", width: 110 }}>
              <div style={{ fontFamily: "'Corben', serif", fontWeight: 700, fontSize: 13, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {song.title}
              </div>
              <div style={{ fontSize: 11, color: "#6970E6", fontWeight: 600 }}>{song.artist}</div>
              <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{song.plays} plays</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Top Albums grid ───────────────────────────────────────────────────────────
function TopAlbums() {
  const [hoveredId, setHoveredId] = useState(null);
  return (
    <div>
      <SectionHeading>Top Albums</SectionHeading>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}
      >
        {TOP_ALBUMS.map((album) => (
          <div
            key={album.id}
            onMouseEnter={() => setHoveredId(album.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              borderRadius: 14,
              overflow: "hidden",
              cursor: "pointer",
              transition: "box-shadow 0.2s, transform 0.2s",
              transform: hoveredId === album.id ? "scale(1.03)" : "scale(1)",
              boxShadow: hoveredId === album.id ? "0 8px 28px rgba(105,112,230,0.35)" : "0 2px 8px rgba(0,0,0,0.08)",
              background: "#fff",
            }}
          >
            <AlbumArt label={album.title} size="100%" round={false} />
            <div style={{ padding: "8px 10px" }}>
              <div style={{ fontFamily: "'Corben', serif", fontWeight: 700, fontSize: 12, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {album.title}
              </div>
              <div style={{ fontSize: 11, color: "#6970E6" }}>{album.artist}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Top Artists row ───────────────────────────────────────────────────────────
function TopArtists() {
  const [hoveredId, setHoveredId] = useState(null);
  return (
    <div>
      <SectionHeading>Top Artists</SectionHeading>
      <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 8 }}>
        {TOP_ARTISTS.map((artist) => (
          <div
            key={artist.id}
            onMouseEnter={() => setHoveredId(artist.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              flexShrink: 0,
              transition: "transform 0.2s",
              transform: hoveredId === artist.id ? "translateY(-5px)" : "translateY(0)",
            }}
          >
            <div
              style={{
                borderRadius: "50%",
                overflow: "hidden",
                boxShadow: hoveredId === artist.id ? "0 0 0 3px #6970E6" : "0 0 0 2px rgba(105,112,230,0.2)",
                transition: "box-shadow 0.2s",
              }}
            >
              <AlbumArt label={artist.name} size={90} round />
            </div>
            <div style={{ fontFamily: "'Corben', serif", fontWeight: 700, fontSize: 12, color: "#1a1a2e", textAlign: "center", width: 90 }}>
              {artist.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat bubble ───────────────────────────────────────────────────────────────
function StatBubble({ number, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6970E6, #2b3194)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Abril Fatface', serif",
          fontSize: 22,
          color: "#fff",
          margin: "0 auto 8px",
          boxShadow: "0 4px 16px rgba(105,112,230,0.4)",
        }}
      >
        {number}
      </div>
      <div style={{ fontFamily: "'Corben', serif", fontWeight: 700, fontSize: 13, color: "#1a1a2e" }}>
        {label}
      </div>
    </div>
  );
}

// ── Right sidebar ─────────────────────────────────────────────────────────────
function ProfileSidebar() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Avatar + Bio */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 2px 16px rgba(105,112,230,0.10)",
          border: "1px solid rgba(105,112,230,0.12)",
        }}
      >
        {/* Avatar */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6970E6, #2b3194)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              boxShadow: "0 4px 20px rgba(105,112,230,0.4)",
            }}
          >
            🐾
          </div>
        </div>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Abril Fatface', serif", fontSize: 20, color: "#1a1a2e" }}>
            my profile
          </div>
          <div style={{ fontFamily: "'Corben', serif", color: "#6970E6", fontSize: 14, fontWeight: 700 }}>
            @username
          </div>
          <div
            style={{
              display: "inline-block",
              marginTop: 6,
              background: "rgba(105,112,230,0.1)",
              color: "#6970E6",
              borderRadius: 20,
              padding: "2px 12px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            UW SEATTLE
          </div>
        </div>
        {/* Divider */}
        <div style={{ height: 1, background: "rgba(105,112,230,0.12)", marginBottom: 14 }} />
        <div style={{ fontFamily: "'Corben', serif", fontWeight: 400, fontSize: 13.5, color: "#444", lineHeight: 1.7, textAlign: "center" }}>
          I like music that is written by bugs. Wormy. You know? Like beetles and moths. Wormy. Mmmm, worms.
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 2px 16px rgba(105,112,230,0.10)",
          border: "1px solid rgba(105,112,230,0.12)",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <StatBubble number={13} label="followers" />
        <StatBubble number={36} label="following" />
      </div>

      {/* Find Friends button */}
      <button
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 14,
          border: "none",
          background: "linear-gradient(135deg, #6970E6, #2b3194)",
          color: "#fff",
          fontFamily: "'Corben', serif",
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
          boxShadow: "0 4px 18px rgba(105,112,230,0.4)",
          letterSpacing: "0.04em",
          transition: "opacity 0.2s, transform 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        find friends
      </button>

      {/* Listening now card */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e, #2b3194)",
          borderRadius: 20,
          padding: 20,
          boxShadow: "0 4px 20px rgba(43,49,148,0.3)",
        }}
      >
        <div style={{ fontFamily: "'Corben', serif", fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          🎵 Now Playing
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <AlbumArt label="Espresso" size={48} />
          <div>
            <div style={{ fontFamily: "'Corben', serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>Espresso</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Sabrina Carpenter</div>
          </div>
        </div>
        {/* Fake progress bar */}
        <div style={{ marginTop: 14, background: "rgba(255,255,255,0.15)", borderRadius: 4, height: 4 }}>
          <div style={{ width: "42%", height: "100%", background: "#6970E6", borderRadius: 4 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'Corben', serif" }}>
          <span>1:17</span><span>2:55</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Profile View ─────────────────────────────────────────────────────────
export default function ProfileView() {
  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Corben:wght@400;700&display=swap"
        rel="stylesheet"
      />

      <div style={{ minHeight: "100vh", background: "#f0f0f8", fontFamily: "'Corben', serif" }}>

        {/* ── Header ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #6970E6 0%, #2b3194 100%)",
            padding: "0 40px",
            height: 220,
            display: "flex",
            alignItems: "flex-end",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", top: 20, right: 120, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

          {/* Logo area */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, paddingBottom: 28, flex: 1 }}>
            <div style={{ fontSize: 36 }}>🎵</div>
            <div>
              <div
                style={{
                  fontFamily: "'Abril Fatface', serif",
                  fontSize: 48,
                  color: "#fff",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                my profile
              </div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontFamily: "'Corben', serif", fontWeight: 700, fontSize: 15 }}>
                username
              </div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ display: "flex", gap: 8, paddingBottom: 28, alignItems: "flex-end" }}>
            {["home", "profile"].map((item) => (
              <button
                key={item}
                style={{
                  background: item === "profile" ? "rgba(255,255,255,0.2)" : "transparent",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                  fontFamily: "'Corben', serif",
                  fontWeight: 700,
                  fontSize: 13,
                  borderRadius: 20,
                  padding: "7px 18px",
                  cursor: "pointer",
                  letterSpacing: "0.03em",
                  backdropFilter: "blur(4px)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = item === "profile" ? "rgba(255,255,255,0.2)" : "transparent"; }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "40px 32px",
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 40,
            alignItems: "start",
          }}
        >
          {/* Left: music content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            <TopSongs />
            <TopAlbums />
            <TopArtists />
          </div>

          {/* Right: sidebar */}
          <ProfileSidebar />
        </div>
      </div>
    </>
  );
}
