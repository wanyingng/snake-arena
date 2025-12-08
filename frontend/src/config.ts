// Environment configuration
// Vite exposes env vars with VITE_ prefix

export const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
} as const;
