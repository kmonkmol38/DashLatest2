import { Cloud, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  isConnected: boolean;
  employeeCount: number;
}

export const Header = ({ isConnected, employeeCount }: HeaderProps) => {
  const [animateCount, setAnimateCount] = useState(false);

  useEffect(() => {
    setAnimateCount(true);
    const timer = setTimeout(() => setAnimateCount(false), 500);
    return () => clearTimeout(timer);
  }, [employeeCount]);

  return (
    <header className="relative z-10">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-neon-cyan">
                <span className="text-2xl font-black text-primary-foreground">E</span>
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple opacity-30 blur-lg animate-pulse-glow" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight gradient-text">
                EMPLOYEE<span className="text-foreground">HUB</span>
              </h1>
              <p className="text-xs text-muted-foreground tracking-widest-xl uppercase">
                QR Lookup System
              </p>
            </div>
          </div>

          {/* Cloud Status */}
          <div className="flex items-center gap-4">
            <div className={`
              glass-card px-4 py-2 flex items-center gap-3
              ${isConnected ? 'border-neon-emerald/30' : 'border-destructive/30'}
            `}>
              <div className="relative">
                {isConnected ? (
                  <Cloud className="w-5 h-5 text-neon-emerald" />
                ) : (
                  <WifiOff className="w-5 h-5 text-destructive" />
                )}
                {isConnected && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-emerald rounded-full status-ping" />
                )}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-bold tracking-wide ${isConnected ? 'text-neon-emerald' : 'text-destructive'}`}>
                  {isConnected ? 'CLOUD LINKED' : 'OFFLINE'}
                </span>
                <span className={`text-[10px] text-muted-foreground transition-all ${animateCount ? 'scale-110' : ''}`}>
                  {employeeCount.toLocaleString()} Records
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
