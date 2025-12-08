// Shared type definitions for API responses
// These match the OpenAPI schema defined in openapi.yaml

export interface User {
    id: string;
    username: string;
    email: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface LeaderboardEntry {
    id: string;
    username: string;
    score: number;
    mode: 'walls' | 'pass-through';
    timestamp: string;
}

export interface ActiveGame {
    id: string;
    username: string;
    score: number;
    mode: 'walls' | 'pass-through';
    snake: Array<{ x: number; y: number }>;
    food: { x: number; y: number };
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    username: string;
    password: string;
}

export interface SubmitScoreRequest {
    score: number;
    mode: 'walls' | 'pass-through';
}
