// Helper to get the correct app URL based on environment
// In dev: points to the app's own Vite server, on the port declared in ports.json
// In prod: uses /app/ relative path (same domain, GitHub Pages)
import { APP_PORT } from '../../../ports';

export const getAppUrl = () => {
    if (import.meta.env.DEV) {
        return `http://localhost:${APP_PORT}`;
    }
    return '/aurawall/app/';
};
