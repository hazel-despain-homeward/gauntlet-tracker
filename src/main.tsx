import React from 'react';
import ReactDOM from 'react-dom/client';
import { GlobalStyle } from './design/GlobalStyle';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
  </React.StrictMode>
);
