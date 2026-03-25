import { Moon, Sun, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export function TopBar({ darkMode, onToggleDark }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/15">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
            LifeBoard
          </h1>
          <p className="text-xs text-muted-foreground">AI-powered goal tracker</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleDark}
        className="rounded-full"
      >
        {darkMode ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </Button>
    </header>
  );
}
