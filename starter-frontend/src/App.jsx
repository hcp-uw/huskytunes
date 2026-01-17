import { useEffect, useState } from 'react'
import FeaturedImages from './components/FeaturedImages/FeaturedImages'
import DrawingCanvas from './components/DrawingCanvas/DrawingCanvas'
import { getMessage } from './services/message';
import './App.css'

// The App component is the root component of the application.
const App = () => {

  // The App component uses the `useState` hook to define a
  // state variable `message` and a function `setMessage` to update it.
  // The initial value of `message` is an empty string, and
  // calling `setMessage` will update the value of `message`,
  // and trigger a re-render of the component.
  const [message, setMessage] = useState('')

  // The `useEffect` hook runs the callback function passed to it.
  // The second argument is the dependency array, which is an array of
  // variables that, when changed, will trigger the callback function.
  // Given an empty array, the callback function will only run once,
  // when the component is first rendered.
  useEffect(() => {
    // The `getMessage` function is defined in the `services/message.js` file.
    // It is an asynchronous function that returns a promise, since it sends
    // an HTTP request to the server. In order to see the message, we need to
    // make sure our server is running.
    getMessage().then(message => setMessage(message))
  }, [])

  // React components return JSX, which is a syntax extension for JavaScript.
  // It looks a lot like HTML, with some key differences. For example, the
  // `className` attribute is used instead of `class` to define a CSS class.
  // One of the most powerful features of JSX is that it allows you to embed
  // JavaScript expressions inside braces `{}`. This allows you to use variables
  // and expressions to define the structure of your UI, including stateful
  // values that will not only be displayed, but also automatically re-rendered
  return (
    <div className='home-page'>
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
