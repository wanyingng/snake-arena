import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { api } from './api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('api', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        mockFetch.mockReset();
    });

    describe('auth', () => {
        it('should login successfully and store token', async () => {
            const mockResponse = {
                user: { id: '1', username: 'testuser', email: 'test@example.com' },
                token: 'test-jwt-token',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => mockResponse,
            });

            const result = await api.login('test@example.com', 'password123');

            expect(result.error).toBeUndefined();
            expect(result.user).toEqual(mockResponse.user);
            expect(localStorage.getItem('auth_token')).toBe('test-jwt-token');
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/auth/login',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
                })
            );
        });

        it('should handle login error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
                json: async () => ({ detail: 'Invalid credentials' }),
            });

            const result = await api.login('test@example.com', 'wrongpass');

            expect(result.error).toBe('Invalid credentials');
            expect(result.user).toBeNull();
        });

        it('should signup successfully and store token', async () => {
            const mockResponse = {
                user: { id: '2', username: 'newuser', email: 'new@example.com' },
                token: 'new-jwt-token',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => mockResponse,
            });

            const result = await api.signup('new@example.com', 'newuser', 'password123');

            expect(result.error).toBeUndefined();
            expect(result.user).toEqual(mockResponse.user);
            expect(localStorage.getItem('auth_token')).toBe('new-jwt-token');
        });

        it('should logout and clear token', async () => {
            localStorage.setItem('auth_token', 'test-token');

            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({}),
            });

            await api.logout();

            expect(localStorage.getItem('auth_token')).toBeNull();
        });

        it('should get current user with valid token', async () => {
            localStorage.setItem('auth_token', 'valid-token');

            const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => mockUser,
            });

            const user = await api.getCurrentUser();

            expect(user).toEqual(mockUser);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/auth/me',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer valid-token',
                    }),
                })
            );
        });

        it('should return null and clear token if getCurrentUser fails', async () => {
            localStorage.setItem('auth_token', 'invalid-token');

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
                json: async () => ({ detail: 'Invalid token' }),
            });

            const user = await api.getCurrentUser();

            expect(user).toBeNull();
            expect(localStorage.getItem('auth_token')).toBeNull();
        });
    });

    describe('leaderboard', () => {
        it('should get leaderboard with filters', async () => {
            const mockLeaderboard = [
                {
                    id: '1',
                    username: 'player1',
                    score: 100,
                    mode: 'walls',
                    timestamp: '2024-01-01T00:00:00Z',
                },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => mockLeaderboard,
            });

            const entries = await api.getLeaderboard('walls', 10);

            expect(entries).toEqual(mockLeaderboard);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/leaderboard?mode=walls&limit=10',
                expect.anything()
            );
        });

        it('should submit score with authentication', async () => {
            localStorage.setItem('auth_token', 'valid-token');

            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ description: 'Score submitted successfully' }),
            });

            await api.submitScore(150, 'pass-through');

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/leaderboard',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer valid-token',
                    }),
                    body: JSON.stringify({ score: 150, mode: 'pass-through' }),
                })
            );
        });
    });

    describe('games', () => {
        it('should get active games', async () => {
            const mockGames = [
                {
                    id: '1',
                    username: 'player1',
                    score: 50,
                    mode: 'walls',
                    snake: [{ x: 10, y: 10 }],
                    food: { x: 15, y: 15 },
                },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => mockGames,
            });

            const games = await api.getActiveGames();

            expect(games).toEqual(mockGames);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/games/active',
                expect.anything()
            );
        });

        it('should return empty array on error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: async () => ({}),
            });

            const games = await api.getActiveGames();

            expect(games).toEqual([]);
        });
    });
});
