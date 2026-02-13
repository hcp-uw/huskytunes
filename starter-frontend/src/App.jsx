import { useEffect, useState } from 'react'
import AlbumRating from './components/AlbumRating/AlbumRating'
import Login from './components/Login/Login'
import { getCurrentUser, logout } from './services/auth';
import './App.css'

// The App component is the root component of the application.
const App = () => {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const result = await getCurrentUser();
      if (result.success) {
        setUser(result.data.user);
      }
      setLoading(false);
    };
    checkAuth();
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  }

  const handleLogout = async () => {
    await logout();
    setUser(null);
  }

  // Show loading state while checking authentication
  if (loading) {
    return <div className='home-page'>Loading...</div>
  }

  // Show login form if user is not authenticated
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className='home-page'>
      <header className='app-header'>
        <h1 className='app-title'>HuskyTunes</h1>
        <div className='header-right'>
          <span className='welcome-text'>Welcome, {user.username}!</span>
          <button onClick={handleLogout} className='logout-button'>
            Logout
          </button>
        </div>
      </header>
      <main>
        <AlbumRating />
      </main>
    </div>
  )
}

// The App component is the default export of this module, and it is imported
// in the `index.js` file in the same directory, which is the entry point of
// the application. This is the component that will be rendered by default
// when the application is started.
//
// Note that exporting something as "default" means that when you import it
// in another file, you can choose the name of the imported module. For example,
// you could import this component in another file and name it `Root`:
//
// ```javascript
// import Root from './App'
// ```
export default App
