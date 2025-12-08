import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import type { LeaderboardEntry } from '@/services/types';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const Leaderboard = () => {
  const [mode, setMode] = useState<'all' | 'walls' | 'pass-through'>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      const data = await api.getLeaderboard(
        mode === 'all' ? undefined : mode,
        20
      );
      setEntries(data);
      setLoading(false);
    };
    loadLeaderboard();
  }, [mode]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-rank-gold" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-rank-silver" />;
    if (rank === 3) return <Award className="w-6 h-6 text-rank-bronze" />;
    return <span className="w-6 text-center text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl text-center mb-8 text-primary text-glow">
            Leaderboard
          </h1>

          {/* Mode filter */}
          <Card className="p-4 mb-6 bg-card border-border">
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => setMode('all')}
                variant={mode === 'all' ? 'default' : 'outline'}
                size="sm"
              >
                All Modes
              </Button>
              <Button
                onClick={() => setMode('walls')}
                variant={mode === 'walls' ? 'default' : 'outline'}
                size="sm"
              >
                Walls
              </Button>
              <Button
                onClick={() => setMode('pass-through')}
                variant={mode === 'pass-through' ? 'default' : 'outline'}
                size="sm"
              >
                Pass-Through
              </Button>
            </div>
          </Card>

          {/* Leaderboard entries */}
          <Card className="p-6 bg-card border-border">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No scores yet. Be the first to play!
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg transition-colors',
                      index < 3 ? 'bg-muted' : 'bg-muted/50',
                      'hover:bg-muted'
                    )}
                  >
                    <div className="flex items-center justify-center w-10">
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{entry.username}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {entry.mode}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-2xl text-primary">
                        {entry.score}
                      </div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
