import React from 'react'
import ReactDOM from 'react-dom/client'
import CircleKeeper from './CircleKeeper.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'

// Polyfill window.storage for standalone deployment (localStorage-based)
if (!window.storage) {
  window.storage = {
    get: async (key) => {
      const value = localStorage.getItem(key);
      return value ? { value } : {};
    },
    set: async (key, value) => {
      localStorage.setItem(key, value);
    },
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <CircleKeeper />
    </ErrorBoundary>
  </React.StrictMode>
)
