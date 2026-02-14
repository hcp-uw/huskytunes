import { useEffect, useState } from 'react'
import CommunitySection from './components/CommunitySection'
import Login from './components/Login/Login'
import AlbumDetail from './components/AlbumDetail'
import SearchResults from './components/SearchResults'
import { getCurrentUser, logout } from './services/auth'
import { getAlbums, searchSpotify } from './services/album'
import './App.css'

const App = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [albums, setAlbums] = useState([]) // Featured albums
  const [searchResults, setSearchResults] = useState([])
  const [showLogin, setShowLogin] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [view, setView] = useState('home') // 'home', 'search', 'detail'

  useEffect(() => {
    const initApp = async () => {
      // Check auth
      const authResult = await getCurrentUser()
      if (authResult.success) {
        setUser(authResult.data.user)
      }

      // Fetch "Most Rated" albums from our site
      const albumResult = await getAlbums()
      if (albumResult.success && albumResult.data.length > 0) {
        setAlbums(albumResult.data.slice(0, 4))
      } else {
        // If no albums have ratings yet, show an empty state or a message
        setAlbums([])
      }
      
      setLoading(false)
    }
    initApp()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    const result = await searchSpotify(searchQuery)
    if (result.success) {
      setSearchResults(result.data)
      setActiveSearchQuery(searchQuery)
      setView('search')
      setSelectedAlbum(null)
    }
    setIsSearching(false)
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setShowLogin(false)
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
    setView('home')
    setSelectedAlbum(null)
  }

  const navigateToHome = () => {
    setView('home')
    setSelectedAlbum(null)
    setSearchQuery('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-2xl font-serif italic">husky tunes...</div>
      </div>
    )
  }

  if (showLogin) {
    return (
      <div className="relative">
        <button 
          onClick={() => setShowLogin(false)}
          className="absolute top-8 left-8 z-50 text-white flex items-center gap-2 font-medium hover:underline"
        >
          ← back to home
        </button>
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar - Always visible */}
      <nav className="w-full flex justify-between items-center px-8 py-4 bg-black text-white z-50 sticky top-0">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={navigateToHome}
        >
          <span className="text-xl">🐾</span>
          <div className="h-4 w-px bg-white/20 mx-2"></div>
          <span className="font-bold tracking-tighter text-lg">HUSKY TUNES</span>
        </div>

        {user && (
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="search albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all pr-10"
            />
            <button 
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-white text-black rounded-full font-bold text-[10px] uppercase hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {isSearching ? '...' : 'go'}
            </button>
          </form>
        )}

        <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
          <div className="flex gap-6 opacity-60">
            <button onClick={navigateToHome} className="hover:opacity-100 transition-opacity uppercase font-bold cursor-pointer">home</button>
            <a href="#" className="hover:opacity-100 transition-opacity cursor-pointer">friends</a>
            <a href="#" className="hover:opacity-100 transition-opacity cursor-pointer">profile</a>
          </div>
          {user ? (
            <div className="flex items-center gap-4 pl-6 border-l border-white/20">
              <span className="opacity-40 lowercase font-medium tracking-normal">hi, {user.username}</span>
              <button 
                onClick={handleLogout}
                className="hover:underline opacity-60 hover:opacity-100 transition-opacity"
              >
                logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4 pl-6 border-l border-white/20">
              <button onClick={() => setShowLogin(true)} className="hover:opacity-100 opacity-60 transition-opacity">login</button>
              <button onClick={() => setShowLogin(true)} className="hover:opacity-100 opacity-60 transition-opacity">signup</button>
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      {view === 'home' && (
        <>
          <section className="relative h-[40vh] flex flex-col items-center justify-center text-white overflow-hidden mesh-gradient">
            <div className="text-center z-10 max-w-4xl px-4 w-full">
              <h1 className="text-7xl md:text-8xl font-display italic tracking-tighter mb-4 leading-tight">
                husky tunes
              </h1>
              <p className="text-base md:text-lg font-light opacity-70 tracking-wide">
                what have you been listening to lately?
              </p>
            </div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          </section>
          <CommunitySection 
            albums={albums} 
            onAlbumClick={(album) => {
              setSelectedAlbum(album)
              setView('detail')
            }}
          />
        </>
      )}

      {view === 'search' && (
        <SearchResults 
          albums={searchResults} 
          query={activeSearchQuery}
          onBack={navigateToHome}
          onAlbumClick={(album) => {
            setSelectedAlbum(album)
            setView('detail')
          }}
        />
      )}

      {view === 'detail' && selectedAlbum && (
        <AlbumDetail 
          album={selectedAlbum} 
          user={user} 
          onBack={() => setView(searchResults.length > 0 ? 'search' : 'home')} 
          backText={searchResults.length > 0 ? 'back to search' : 'back to community'}
        />
      )}

      <footer className="py-12 border-t border-gray-100 text-center text-gray-400 text-sm">
        <p>© 2026 Husky Tunes. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
