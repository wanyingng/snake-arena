// Real API service for backend communication
import { config } from '@/config';
import type {
    User,
    AuthResponse,
    LeaderboardEntry,
    ActiveGame,
    LoginRequest,
    SignupRequest,
    SubmitScoreRequest,
} from './types';

const API_BASE = config.apiBaseUrl;

// Token management
const TOKEN_KEY = 'auth_token';

const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

const clearToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

// API error handling
class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

// Generic fetch wrapper with auth header injection
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            response.status,
            errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
    }

    // Handle empty responses (e.g., 204 No Content)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }

    return {} as T;
}

export const api = {
    // Auth endpoints
    async login(email: string, password: string): Promise<{ user: User; error?: string }> {
        try {
            const body: LoginRequest = { email, password };
            const data = await apiFetch<AuthResponse>('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(body),
            });

            setToken(data.token);
            return { user: data.user };
        } catch (error) {
            if (error instanceof ApiError) {
                return { user: null as any, error: error.message };
            }
            return { user: null as any, error: 'Network error. Please try again.' };
        }
    },

    async signup(
        email: string,
        username: string,
        password: string
    ): Promise<{ user: User; error?: string }> {
        try {
            const body: SignupRequest = { email, username, password };
            const data = await apiFetch<AuthResponse>('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify(body),
            });

            setToken(data.token);
            return { user: data.user };
        } catch (error) {
            if (error instanceof ApiError) {
                return { user: null as any, error: error.message };
            }
            return { user: null as any, error: 'Network error. Please try again.' };
        }
    },

    async logout(): Promise<void> {
        try {
            await apiFetch('/api/auth/logout', {
                method: 'POST',
            });
        } catch (error) {
            // Logout on client side even if server request fails
            console.error('Logout error:', error);
        } finally {
            clearToken();
        }
    },

    async getCurrentUser(): Promise<User | null> {
        const token = getToken();
        if (!token) {
            return null;
        }

        try {
            const user = await apiFetch<User>('/api/auth/me');
            return user;
        } catch (error) {
            // If token is invalid or expired, clear it
            clearToken();
            return null;
        }
    },

    // Leaderboard endpoints
    async getLeaderboard(
        mode?: 'walls' | 'pass-through',
        limit: number = 10
    ): Promise<LeaderboardEntry[]> {
        const params = new URLSearchParams();
        if (mode) {
            params.append('mode', mode);
        }
        params.append('limit', limit.toString());

        const queryString = params.toString();
        const endpoint = `/api/leaderboard${queryString ? `?${queryString}` : ''}`;

        try {
            const entries = await apiFetch<LeaderboardEntry[]>(endpoint);
            return entries;
        } catch (error) {
            console.error('Get leaderboard error:', error);
            return [];
        }
    },

    async submitScore(score: number, mode: 'walls' | 'pass-through'): Promise<void> {
        const body: SubmitScoreRequest = { score, mode };
        await apiFetch('/api/leaderboard', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    // Games endpoints
    async getActiveGames(): Promise<ActiveGame[]> {
        try {
            const games = await apiFetch<ActiveGame[]>('/api/games/active');
            return games;
        } catch (error) {
            console.error('Get active games error:', error);
            return [];
        }
    },
};
