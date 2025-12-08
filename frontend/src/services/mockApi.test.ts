import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockApi } from './mockApi';

describe('mockApi', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('auth', () => {
    it('should login successfully with valid credentials', async () => {
      const result = await mockApi.login('snake@example.com', 'password123');
      expect(result.error).toBeUndefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('snake@example.com');
    });

    it('should fail login with invalid credentials', async () => {
      const result = await mockApi.login('invalid@example.com', 'wrong');
      expect(result.error).toBeDefined();
    });

    it('should signup successfully with unique email', async () => {
      const result = await mockApi.signup('new@example.com', 'NewUser', 'password123');
      expect(result.error).toBeUndefined();
      expect(result.user).toBeDefined();
      expect(result.user.username).toBe('NewUser');
    });

    it('should fail signup with duplicate email', async () => {
      await mockApi.signup('test@example.com', 'User1', 'password123');
      const result = await mockApi.signup('test@example.com', 'User2', 'password123');
      expect(result.error).toBe('Email already exists');
    });

    it('should fail signup with duplicate username', async () => {
      await mockApi.signup('test1@example.com', 'TestUser', 'password123');
      const result = await mockApi.signup('test2@example.com', 'TestUser', 'password123');
      expect(result.error).toBe('Username already taken');
    });

    it('should fail signup with short password', async () => {
      const result = await mockApi.signup('short@example.com', 'ShortUser', 'short');
      expect(result.error).toBe('Password must be at least 6 characters');
    });

    it('should logout successfully', async () => {
      await mockApi.login('snake@example.com', 'password123');
      await mockApi.logout();
      const user = await mockApi.getCurrentUser();
      expect(user).toBeNull();
    });

    it('should persist user in localStorage', async () => {
      await mockApi.login('snake@example.com', 'password123');
      const user = await mockApi.getCurrentUser();
      expect(user).toBeDefined();
      expect(user!.email).toBe('snake@example.com');
    });
  });

  describe('leaderboard', () => {
    it('should get full leaderboard', async () => {
      const leaderboard = await mockApi.getLeaderboard();
      expect(leaderboard.length).toBeGreaterThan(0);
      expect(leaderboard[0].score).toBeGreaterThanOrEqual(leaderboard[1].score);
    });

    it('should filter leaderboard by mode', async () => {
      const leaderboard = await mockApi.getLeaderboard('walls');
      expect(leaderboard.every(e => e.mode === 'walls')).toBe(true);
    });

    it('should limit leaderboard entries', async () => {
      const leaderboard = await mockApi.getLeaderboard(undefined, 3);
      expect(leaderboard.length).toBeLessThanOrEqual(3);
    });

    it('should submit score when authenticated', async () => {
      await mockApi.login('snake@example.com', 'password123');
      await expect(mockApi.submitScore(100, 'walls')).resolves.not.toThrow();
    });

    it('should fail to submit score when not authenticated', async () => {
      await mockApi.logout();
      await expect(mockApi.submitScore(100, 'walls')).rejects.toThrow('Not authenticated');
    });
  });

  describe('active games', () => {
    it('should get active games', async () => {
      const games = await mockApi.getActiveGames();
      expect(Array.isArray(games)).toBe(true);
      expect(games.length).toBeGreaterThan(0);
      expect(games[0]).toHaveProperty('username');
      expect(games[0]).toHaveProperty('snake');
      expect(games[0]).toHaveProperty('food');
    });
  });
});
