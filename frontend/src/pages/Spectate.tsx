import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { GameBoard } from '@/components/GameBoard';
import { api } from '@/services/api';
import type { ActiveGame } from '@/services/types';
import { updateGameState, type GameState, type Direction } from '@/lib/gameLogic';
import { Eye } from 'lucide-react';

const Spectate = () => {
  const [activeGames, setActiveGames] = useState<ActiveGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<ActiveGame | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      const games = await api.getActiveGames();
      setActiveGames(games);
      if (games.length > 0 && !selectedGame) {
        setSelectedGame(games[0]);
      }
    };
    loadGames();
  }, [selectedGame]);

  // Simulate game progression for spectating
  useEffect(() => {
    if (!selectedGame) return;

    const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    let currentDirection: Direction = directions[Math.floor(Math.random() * directions.length)];

    const state: GameState = {
      snake: selectedGame.snake,
      food: selectedGame.food,
      direction: currentDirection,
      score: selectedGame.score,
      gameOver: false,
      mode: selectedGame.mode,
    };

    setGameState(state);

    const interval = setInterval(() => {
      setGameState((prev) => {
        if (!prev || prev.gameOver) return prev;

        // Randomly change direction sometimes
        if (Math.random() < 0.1) {
          const newDirection = directions[Math.floor(Math.random() * directions.length)];
          currentDirection = newDirection;
        }

        const newState = updateGameState({ ...prev, direction: currentDirection });

        // Reset if game over
        if (newState.gameOver) {
          return {
            snake: selectedGame.snake,
            food: selectedGame.food,
            direction: directions[Math.floor(Math.random() * directions.length)],
            score: 0,
            gameOver: false,
            mode: selectedGame.mode,
          };
        }

        return newState;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [selectedGame]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-4xl text-center mb-8 text-primary text-glow">
            Spectate Live Games
          </h1>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Game list */}
            <Card className="p-6 bg-card border-border h-fit">
              <h2 className="font-display text-xl mb-4 text-primary">Active Games</h2>
              <div className="space-y-2">
                {activeGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGame(game)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${selectedGame?.id === game.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4" />
                      <span className="font-semibold">{game.username}</span>
                    </div>
                    <div className="text-sm opacity-80">
                      Score: {game.score} • {game.mode}
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Game view */}
            <div className="md:col-span-2">
              {gameState && selectedGame ? (
                <Card className="p-6 bg-card border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-2xl text-primary">
                      {selectedGame.username}
                    </h2>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Score</div>
                      <div className="font-display text-3xl text-primary">
                        {gameState.score}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <GameBoard gameState={gameState} />
                  </div>
                  <div className="mt-4 text-center text-sm text-muted-foreground capitalize">
                    Mode: {gameState.mode}
                  </div>
                </Card>
              ) : (
                <Card className="p-6 bg-card border-border">
                  <div className="text-center py-16 text-muted-foreground">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No active games to spectate</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Spectate;
