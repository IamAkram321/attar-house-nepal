import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// In production, the frontend (Vercel) and backend (Render) live on different
// domains, so relative "/api/..." calls from the generated hooks need an
// absolute base URL. Locally, VITE_API_URL is unset and requests stay
// relative, going through Vite's dev proxy as before.
if (import.meta.env.VITE_API_URL) {
  setBaseUrl(import.meta.env.VITE_API_URL);
}

createRoot(document.getElementById('root')!).render(<App />);