// Helper to get the correct app URL based on environment
// In dev: points to localhost:3000 directly (separate Vite server)
// In prod: uses /app/ relative path (same domain, GitHub Pages)
export const getAppUrl = () => {
    if (import.meta.env.DEV) {
        return 'http://localhost:3000';
    }
    return '/aurawall/app/';
};
