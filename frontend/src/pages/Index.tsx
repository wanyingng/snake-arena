import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { GameBoard } from '@/components/GameBoard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
  createInitialGameState,
  updateGameState,
  canChangeDirection,
  type Direction,
  type GameMode,
  type GameState,
} from '@/lib/gameLogic';
import { Play, Pause, RotateCcw } from 'lucide-react';

const Index = () => {
  const [mode, setMode] = useState<GameMode>('walls');
  const [gameState, setGameState] = useState<GameState>(createInitialGameState(mode));
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(150);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDirectionChange = useCallback(
    (newDirection: Direction) => {
      if (canChangeDirection(gameState.direction, newDirection)) {
        setGameState((prev) => ({ ...prev, direction: newDirection }));
      }
    },
    [gameState.direction]
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        s: 'DOWN',
        a: 'LEFT',
        d: 'RIGHT',
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        handleDirectionChange(direction);
        if (!isPlaying && !gameState.gameOver) {
          setIsPlaying(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleDirectionChange, isPlaying, gameState.gameOver]);

  useEffect(() => {
    if (!isPlaying || gameState.gameOver) return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        const newState = updateGameState(prev);
        if (newState.gameOver && user) {
          api.submitScore(newState.score, mode);
          toast({
            title: 'Game Over!',
            description: `Final score: ${newState.score}`,
          });
        }
        return newState;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, gameState.gameOver, user, mode, toast]);

  const resetGame = () => {
    setGameState(createInitialGameState(mode));
    setIsPlaying(false);
  };

  const toggleMode = (newMode: GameMode) => {
    setMode(newMode);
    setGameState(createInitialGameState(newMode));
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Game area */}
          <div className="flex flex-col gap-4">
            <Card className="p-6 bg-card border-border">
              <GameBoard gameState={gameState} />
              {gameState.gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-lg">
                  <div className="text-center">
                    <h2 className="font-display text-4xl text-destructive mb-4">GAME OVER</h2>
                    <p className="text-xl mb-6">Score: {gameState.score}</p>
                    <Button onClick={resetGame} size="lg" className="gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Play Again
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Controls */}
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={gameState.gameOver}
                    variant="default"
                    size="sm"
                    className="gap-2"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Play
                      </>
                    )}
                  </Button>
                  <Button onClick={resetGame} variant="outline" size="sm" className="gap-2">
                    <RotateCcw className="w-4 h-4" /> Reset
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Use arrow keys or WASD to move
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4 w-full lg:w-80">
            {/* Score */}
            <Card className="p-6 bg-card border-border">
              <h3 className="font-display text-lg mb-2 text-primary">Score</h3>
              <p className="text-4xl font-bold text-glow">{gameState.score}</p>
            </Card>

            {/* Mode selection */}
            <Card className="p-6 bg-card border-border">
              <h3 className="font-display text-lg mb-4 text-primary">Game Mode</h3>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => toggleMode('walls')}
                  variant={mode === 'walls' ? 'default' : 'outline'}
                  className="justify-start"
                >
                  <span className="font-semibold">Walls</span>
                  <span className="ml-2 text-xs text-muted-foreground">Hit wall = game over</span>
                </Button>
                <Button
                  onClick={() => toggleMode('pass-through')}
                  variant={mode === 'pass-through' ? 'default' : 'outline'}
                  className="justify-start"
                >
                  <span className="font-semibold">Pass-Through</span>
                  <span className="ml-2 text-xs text-muted-foreground">Wrap around edges</span>
                </Button>
              </div>
            </Card>

            {/* Instructions */}
            <Card className="p-6 bg-card border-border">
              <h3 className="font-display text-lg mb-4 text-primary">How to Play</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use arrow keys or WASD to control the snake</li>
                <li>• Eat food to grow and earn points</li>
                <li>• Avoid hitting your own tail</li>
                <li>• In Walls mode, avoid hitting the walls</li>
                <li>• In Pass-Through mode, wrap around the edges</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
