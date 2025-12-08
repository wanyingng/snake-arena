export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'walls' | 'pass-through';
export type Position = { x: number; y: number };

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  gameOver: boolean;
  mode: GameMode;
}

export const GRID_SIZE = 20;
export const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

export const getRandomPosition = (excludePositions: Position[] = []): Position => {
  let position: Position;
  let attempts = 0;
  const maxAttempts = 100;

  // Try random positions first
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    attempts++;
  } while (
    attempts < maxAttempts &&
    excludePositions.some((pos) => pos.x === position.x && pos.y === position.y)
  );

  // If we found a valid position, return it
  if (!excludePositions.some((pos) => pos.x === position.x && pos.y === position.y)) {
    return position;
  }

  // Fallback: Find all available positions and pick one
  const available: Position[] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!excludePositions.some((pos) => pos.x === x && pos.y === y)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) {
    // Should not happen in normal gameplay, but return a default to avoid crash
    return { x: 0, y: 0 };
  }

  return available[Math.floor(Math.random() * available.length)];
};

export const getNextHeadPosition = (head: Position, direction: Direction): Position => {
  const moves: Record<Direction, Position> = {
    UP: { x: head.x, y: head.y - 1 },
    DOWN: { x: head.x, y: head.y + 1 },
    LEFT: { x: head.x - 1, y: head.y },
    RIGHT: { x: head.x + 1, y: head.y },
  };

  return moves[direction];
};

export const normalizePosition = (pos: Position, mode: GameMode): Position => {
  if (mode === 'pass-through') {
    return {
      x: (pos.x + GRID_SIZE) % GRID_SIZE,
      y: (pos.y + GRID_SIZE) % GRID_SIZE,
    };
  }
  return pos;
};

export const isOutOfBounds = (pos: Position): boolean => {
  return pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE;
};

export const checkSelfCollision = (snake: Position[]): boolean => {
  const head = snake[0];
  return snake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y);
};

export const checkFoodCollision = (head: Position, food: Position): boolean => {
  return head.x === food.x && head.y === food.y;
};

export const updateGameState = (state: GameState): GameState => {
  const head = state.snake[0];
  let nextHead = getNextHeadPosition(head, state.direction);
  nextHead = normalizePosition(nextHead, state.mode);

  // Check wall collision for walls mode
  if (state.mode === 'walls' && isOutOfBounds(nextHead)) {
    return { ...state, gameOver: true };
  }

  // Check self collision
  const newSnake = [nextHead, ...state.snake];
  if (checkSelfCollision(newSnake)) {
    return { ...state, gameOver: true };
  }

  // Check food collision
  const ateFood = checkFoodCollision(nextHead, state.food);
  const snake = ateFood ? newSnake : newSnake.slice(0, -1);
  const food = ateFood ? getRandomPosition(snake) : state.food;
  const score = ateFood ? state.score + 10 : state.score;

  return {
    ...state,
    snake,
    food,
    score,
  };
};

export const createInitialGameState = (mode: GameMode): GameState => {
  return {
    snake: INITIAL_SNAKE,
    food: getRandomPosition(INITIAL_SNAKE),
    direction: 'UP',
    score: 0,
    gameOver: false,
    mode,
  };
};

export const getOppositeDirection = (direction: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[direction];
};

export const canChangeDirection = (currentDirection: Direction, newDirection: Direction): boolean => {
  return getOppositeDirection(currentDirection) !== newDirection;
};
