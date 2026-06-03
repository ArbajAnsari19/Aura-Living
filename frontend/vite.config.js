import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// In dev we proxy /api to the backend so the browser makes same-origin calls
// (no CORS friction). In prod, set VITE_API_BASE_URL to the deployed API URL.
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
        },
    },
});
