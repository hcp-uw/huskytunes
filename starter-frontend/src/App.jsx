import { useEffect, useState } from 'react'
import FeaturedImages from './components/FeaturedImages/FeaturedImages'
import DrawingCanvas from './components/DrawingCanvas/DrawingCanvas'
import Login from './components/Login/Login'
import { getMessage } from './services/message';
import { getCurrentUser, logout } from './services/auth';
import './App.css'

// The App component is the root component of the application.
const App = () => {

  // The App component uses the `useState` hook to define a
  // state variable `message` and a function `setMessage` to update it.
  // The initial value of `message` is an empty string, and
  // calling `setMessage` will update the value of `message`,
  // and trigger a re-render of the component.
  const [message, setMessage] = useState('')
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

  // The `useEffect` hook runs the callback function passed to it.
  // The second argument is the dependency array, which is an array of
  // variables that, when changed, will trigger the callback function.
  // Given an empty array, the callback function will only run once,
  // when the component is first rendered.
  useEffect(() => {
    // Only fetch message if user is logged in
    if (user) {
      getMessage().then(message => setMessage(message))
    }
  }, [user])

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
        <div>Welcome, {user.username}!</div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
      <FeaturedImages/>
      <p className='message'>{message}</p>
      <DrawingCanvas />
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
