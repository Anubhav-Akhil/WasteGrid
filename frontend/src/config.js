/**
 * Dynamically resolves the backend API URL.
 * If running on localhost or 127.0.0.1, it defaults to the local backend (http://localhost:5000).
 * Otherwise, it uses the VITE_API_URL environment variable or falls back to the production backend.
 */
export const getBackendUrl = () => {
  const isLocal = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '[::1]');
  
  if (isLocal) {
    return 'http://localhost:5000';
  }
  
  return import.meta.env.VITE_API_URL || 'https://wastegrid.onrender.com';
};
