import { describe, it, expect } from 'vitest';
import {
  getRandomPosition,
  getNextHeadPosition,
  normalizePosition,
  isOutOfBounds,
  checkSelfCollision,
  checkFoodCollision,
  updateGameState,
  createInitialGameState,
  getOppositeDirection,
  canChangeDirection,
  GRID_SIZE,
  type Position,
} from './gameLogic';

describe('gameLogic', () => {
  describe('getRandomPosition', () => {
    it('should return a position within grid bounds', () => {
      const pos = getRandomPosition();
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.x).toBeLessThan(GRID_SIZE);
      expect(pos.y).toBeGreaterThanOrEqual(0);
      expect(pos.y).toBeLessThan(GRID_SIZE);
    });

    it('should exclude specified positions', () => {
      const exclude: Position[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          if (!(x === 0 && y === 0)) {
            exclude.push({ x, y });
          }
        }
      }
      const pos = getRandomPosition(exclude);
      expect(pos).toEqual({ x: 0, y: 0 });
    });
  });

  describe('getNextHeadPosition', () => {
    it('should move up correctly', () => {
      const head = { x: 5, y: 5 };
      const next = getNextHeadPosition(head, 'UP');
      expect(next).toEqual({ x: 5, y: 4 });
    });

    it('should move down correctly', () => {
      const head = { x: 5, y: 5 };
      const next = getNextHeadPosition(head, 'DOWN');
      expect(next).toEqual({ x: 5, y: 6 });
    });

    it('should move left correctly', () => {
      const head = { x: 5, y: 5 };
      const next = getNextHeadPosition(head, 'LEFT');
      expect(next).toEqual({ x: 4, y: 5 });
    });

    it('should move right correctly', () => {
      const head = { x: 5, y: 5 };
      const next = getNextHeadPosition(head, 'RIGHT');
      expect(next).toEqual({ x: 6, y: 5 });
    });
  });

  describe('normalizePosition', () => {
    it('should wrap position in pass-through mode', () => {
      const pos = { x: -1, y: 5 };
      const normalized = normalizePosition(pos, 'pass-through');
      expect(normalized).toEqual({ x: GRID_SIZE - 1, y: 5 });
    });

    it('should not wrap position in walls mode', () => {
      const pos = { x: -1, y: 5 };
      const normalized = normalizePosition(pos, 'walls');
      expect(normalized).toEqual(pos);
    });
  });

  describe('isOutOfBounds', () => {
    it('should return true for out of bounds position', () => {
      expect(isOutOfBounds({ x: -1, y: 5 })).toBe(true);
      expect(isOutOfBounds({ x: GRID_SIZE, y: 5 })).toBe(true);
      expect(isOutOfBounds({ x: 5, y: -1 })).toBe(true);
      expect(isOutOfBounds({ x: 5, y: GRID_SIZE })).toBe(true);
    });

    it('should return false for in bounds position', () => {
      expect(isOutOfBounds({ x: 0, y: 0 })).toBe(false);
      expect(isOutOfBounds({ x: GRID_SIZE - 1, y: GRID_SIZE - 1 })).toBe(false);
    });
  });

  describe('checkSelfCollision', () => {
    it('should return true when snake collides with itself', () => {
      const snake: Position[] = [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 5, y: 5 },
      ];
      expect(checkSelfCollision(snake)).toBe(true);
    });

    it('should return false when no collision', () => {
      const snake: Position[] = [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 6, y: 6 },
      ];
      expect(checkSelfCollision(snake)).toBe(false);
    });
  });

  describe('checkFoodCollision', () => {
    it('should return true when head is on food', () => {
      const head = { x: 5, y: 5 };
      const food = { x: 5, y: 5 };
      expect(checkFoodCollision(head, food)).toBe(true);
    });

    it('should return false when head is not on food', () => {
      const head = { x: 5, y: 5 };
      const food = { x: 6, y: 6 };
      expect(checkFoodCollision(head, food)).toBe(false);
    });
  });

  describe('updateGameState', () => {
    it('should move snake forward', () => {
      const state = createInitialGameState('walls');
      const newState = updateGameState(state);
      expect(newState.snake[0].y).toBe(state.snake[0].y - 1);
    });

    it('should detect wall collision in walls mode', () => {
      const state = createInitialGameState('walls');
      state.snake = [{ x: 0, y: 0 }];
      state.direction = 'UP';
      const newState = updateGameState(state);
      expect(newState.gameOver).toBe(true);
    });

    it('should wrap around in pass-through mode', () => {
      const state = createInitialGameState('pass-through');
      state.snake = [{ x: 0, y: 0 }];
      state.direction = 'UP';
      const newState = updateGameState(state);
      expect(newState.gameOver).toBe(false);
      expect(newState.snake[0].y).toBe(GRID_SIZE - 1);
    });

    it('should grow snake when eating food', () => {
      const state = createInitialGameState('walls');
      state.snake = [{ x: 5, y: 5 }];
      state.food = { x: 5, y: 4 };
      state.direction = 'UP';
      const initialLength = state.snake.length;
      const newState = updateGameState(state);
      expect(newState.snake.length).toBe(initialLength + 1);
      expect(newState.score).toBe(10);
    });
  });

  describe('getOppositeDirection', () => {
    it('should return opposite directions correctly', () => {
      expect(getOppositeDirection('UP')).toBe('DOWN');
      expect(getOppositeDirection('DOWN')).toBe('UP');
      expect(getOppositeDirection('LEFT')).toBe('RIGHT');
      expect(getOppositeDirection('RIGHT')).toBe('LEFT');
    });
  });

  describe('canChangeDirection', () => {
    it('should prevent 180 degree turns', () => {
      expect(canChangeDirection('UP', 'DOWN')).toBe(false);
      expect(canChangeDirection('LEFT', 'RIGHT')).toBe(false);
    });

    it('should allow perpendicular turns', () => {
      expect(canChangeDirection('UP', 'LEFT')).toBe(true);
      expect(canChangeDirection('UP', 'RIGHT')).toBe(true);
    });
  });

  describe('createInitialGameState', () => {
    it('should create valid initial state', () => {
      const state = createInitialGameState('walls');
      expect(state.snake.length).toBeGreaterThan(0);
      expect(state.score).toBe(0);
      expect(state.gameOver).toBe(false);
      expect(state.mode).toBe('walls');
    });
  });
});
