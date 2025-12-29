import { Database, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface StatusBarProps {
  employeeCount: number;
  lastSync: Date | null;
  onReset: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const StatusBar = ({ 
  employeeCount, 
  lastSync, 
  onReset, 
  onRefresh,
  isLoading 
}: StatusBarProps) => {
  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="glass-card mx-4 mb-6 px-4 py-3">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm font-medium">
              <span className="text-neon-cyan font-bold">{employeeCount.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">employees loaded</span>
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-xs text-muted-foreground">
            Last sync: <span className="text-foreground font-medium">{formatTime(lastSync)}</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-muted-foreground hover:text-neon-cyan"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};
