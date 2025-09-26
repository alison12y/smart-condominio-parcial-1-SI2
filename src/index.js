import React from 'react';
import ReactDOM from 'react-dom/client';
import '../src/styles/index.css';
import App from '../src/api/App';
import reportWebVitals from '../src/api/reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


reportWebVitals();
