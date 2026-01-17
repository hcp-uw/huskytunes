import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// The `ReactDOM.createRoot` selects the root DOM node where the React
// application will be rendered. Then, the `root.render` method is called
// with the root component of the application. In this case, we render the
// `App` component wrapped in a `React.StrictMode` component, which is a tool
// for highlighting potential problems in an application. It activates additional
// checks and warnings for its descendants.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

