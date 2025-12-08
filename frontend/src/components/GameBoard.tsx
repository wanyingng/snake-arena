import { GRID_SIZE, type GameState } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  gameState: GameState;
  cellSize?: number;
}

export const GameBoard = ({ gameState, cellSize = 20 }: GameBoardProps) => {
  const { snake, food } = gameState;

  const isSnakeSegment = (x: number, y: number) => {
    return snake.some((segment) => segment.x === x && segment.y === y);
  };

  const isSnakeHead = (x: number, y: number) => {
    return snake[0].x === x && snake[0].y === y;
  };

  const isFood = (x: number, y: number) => {
    return food.x === x && food.y === y;
  };

  return (
    <div
      className="relative border-2 border-primary rounded-lg overflow-hidden glow-primary"
      style={{
        width: GRID_SIZE * cellSize,
        height: GRID_SIZE * cellSize,
        background: 'hsl(var(--game-grid))',
      }}
    >
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: GRID_SIZE }).map((_, y) =>
          Array.from({ length: GRID_SIZE }).map((_, x) => (
            <div
              key={`${x}-${y}`}
              className="absolute border-r border-b border-muted-foreground"
              style={{
                left: x * cellSize,
                top: y * cellSize,
                width: cellSize,
                height: cellSize,
              }}
            />
          ))
        )}
      </div>

      {/* Snake */}
      {snake.map((segment, index) => (
        <div
          key={`snake-${index}`}
          className={cn(
            'absolute rounded-sm',
            isSnakeHead(segment.x, segment.y) ? 'bg-game-snake glow-accent' : 'bg-game-snake/80'
          )}
          style={{
            left: segment.x * cellSize + 1,
            top: segment.y * cellSize + 1,
            width: cellSize - 2,
            height: cellSize - 2,
          }}
        />
      ))}

      {/* Food */}
      <div
        className="absolute bg-game-food rounded-full animate-pulse"
        style={{
          left: food.x * cellSize + cellSize / 4,
          top: food.y * cellSize + cellSize / 4,
          width: cellSize / 2,
          height: cellSize / 2,
          boxShadow: '0 0 10px hsl(var(--food-color))',
        }}
      />
    </div>
  );
};