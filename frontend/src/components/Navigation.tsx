import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Gamepad2, Trophy, Eye, LogOut, User } from 'lucide-react';

export const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-display text-2xl text-primary glow-primary">
              SNAKE<span className="text-accent">.</span>IO
            </h1>
            <div className="hidden md:flex gap-4">
              <NavLink
                to="/"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                activeClassName="text-primary bg-muted"
              >
                <Gamepad2 className="w-4 h-4" />
                Play
              </NavLink>
              <NavLink
                to="/leaderboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                activeClassName="text-primary bg-muted"
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </NavLink>
              <NavLink
                to="/spectate"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                activeClassName="text-primary bg-muted"
              >
                <Eye className="w-4 h-4" />
                Spectate
              </NavLink>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
                <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <NavLink to="/login">
                <Button variant="default" size="sm">
                  Login
                </Button>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
