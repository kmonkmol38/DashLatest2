import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, QrCode, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onScanClick: () => void;
  isLoading: boolean;
}

export const SearchBar = ({ onSearch, onScanClick, isLoading }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="px-4 mb-8">
      {/* Main Scan Button */}
      <Button
        variant="scan"
        size="xl"
        className="w-full mb-4 relative overflow-hidden group"
        onClick={onScanClick}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan opacity-0 group-hover:opacity-20 transition-opacity bg-[length:200%_100%] animate-[shimmer_3s_infinite]" />
        <QrCode className="w-6 h-6 mr-2" />
        <span className="font-black text-lg tracking-wide">SCAN QR CODE</span>
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="text-xs text-muted-foreground font-medium tracking-widest">OR SEARCH</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter Employee ID or Card Number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12"
          />
        </div>
        <Button 
          type="submit" 
          variant="glass"
          disabled={!query.trim() || isLoading}
          className="px-6"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </Button>
      </form>
    </div>
  );
};
