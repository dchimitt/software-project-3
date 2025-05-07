import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';  // <-- make sure you have this file too

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
