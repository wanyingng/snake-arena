// Centralized mock API service for all backend calls
import type { User, LeaderboardEntry, ActiveGame } from './types';


// Mock storage
let mockUsers: User[] = [
  { id: '1', username: 'Snakemaster99', email: 'snake@example.com' },
  { id: '2', username: 'GridWarrior', email: 'grid@example.com' },
  { id: '3', username: 'NeonViper', email: 'neon@example.com' },
];

let mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'Snakemaster99', score: 450, mode: 'walls', timestamp: new Date().toISOString() },
  { id: '2', username: 'GridWarrior', score: 380, mode: 'walls', timestamp: new Date().toISOString() },
  { id: '3', username: 'NeonViper', score: 320, mode: 'pass-through', timestamp: new Date().toISOString() },
  { id: '4', username: 'PixelHunter', score: 290, mode: 'walls', timestamp: new Date().toISOString() },
  { id: '5', username: 'ArcadeKing', score: 250, mode: 'pass-through', timestamp: new Date().toISOString() },
];

let currentUser: User | null = null;

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; error?: string }> {
    await delay();
    const user = mockUsers.find(u => u.email === email);
    if (!user || password.length < 3) {
      return { user: null as any, error: 'Invalid credentials' };
    }
    currentUser = user;
    localStorage.setItem('mockUser', JSON.stringify(user));
    return { user };
  },

  async signup(email: string, username: string, password: string): Promise<{ user: User; error?: string }> {
    await delay();
    if (mockUsers.some(u => u.email === email)) {
      return { user: null as any, error: 'Email already exists' };
    }
    if (mockUsers.some(u => u.username === username)) {
      return { user: null as any, error: 'Username already taken' };
    }
    if (password.length < 6) {
      return { user: null as any, error: 'Password must be at least 6 characters' };
    }
    const newUser: User = {
      id: String(mockUsers.length + 1),
      username,
      email,
    };
    mockUsers.push(newUser);
    currentUser = newUser;
    localStorage.setItem('mockUser', JSON.stringify(newUser));
    return { user: newUser };
  },

  async logout(): Promise<void> {
    await delay();
    currentUser = null;
    localStorage.removeItem('mockUser');
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    if (currentUser) return currentUser;
    const stored = localStorage.getItem('mockUser');
    if (stored) {
      currentUser = JSON.parse(stored);
      return currentUser;
    }
    return null;
  },

  // Leaderboard
  async getLeaderboard(mode?: 'walls' | 'pass-through', limit: number = 10): Promise<LeaderboardEntry[]> {
    await delay();
    let entries = [...mockLeaderboard];
    if (mode) {
      entries = entries.filter(e => e.mode === mode);
    }
    return entries
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  async submitScore(score: number, mode: 'walls' | 'pass-through'): Promise<void> {
    await delay();
    if (!currentUser) throw new Error('Not authenticated');
    const entry: LeaderboardEntry = {
      id: String(mockLeaderboard.length + 1),
      username: currentUser.username,
      score,
      mode,
      timestamp: new Date().toISOString(),
    };
    mockLeaderboard.push(entry);
  },

  // Active games for spectating
  async getActiveGames(): Promise<ActiveGame[]> {
    await delay();
    // Generate mock active games
    return [
      {
        id: '1',
        username: 'Snakemaster99',
        score: 120,
        mode: 'walls',
        snake: [
          { x: 10, y: 10 },
          { x: 10, y: 11 },
          { x: 10, y: 12 },
        ],
        food: { x: 15, y: 8 },
      },
      {
        id: '2',
        username: 'GridWarrior',
        score: 80,
        mode: 'pass-through',
        snake: [
          { x: 5, y: 5 },
          { x: 6, y: 5 },
        ],
        food: { x: 12, y: 12 },
      },
    ];
  },
};
