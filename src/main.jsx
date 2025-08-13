// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';      // NEW: Import the Provider
import { store } from './redux/app/store';       // NEW: Import your configured store
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // The Provider component makes the Redux store available to any
  // nested components that need to access it.
  <Provider store={store}>                 
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);