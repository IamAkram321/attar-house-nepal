import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';
import { API_URL } from './lib/api-url';

import './index.css';

// Production uses the same-origin /api rewrite (API_URL is empty). Local dev
// may still use the explicit VITE_API_URL or the localhost fallback.
if (API_URL) {
  setBaseUrl(API_URL);
}

createRoot(document.getElementById('root')!).render(<App />);