import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Lock, User, AlertCircle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

const ADMIN_USERNAME = "Admin";
const ADMIN_PASSWORD = "Abbas@123";

export const AuthModal = ({ isOpen, onClose, onSuccess, title = "Admin Authentication" }: AuthModalProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate network delay for security
    await new Promise(resolve => setTimeout(resolve, 500));

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      toast({
        title: "Authentication Successful",
        description: "Welcome, Admin!",
      });
      setUsername("");
      setPassword("");
      onSuccess();
    } else {
      setError("Invalid credentials. Please try again.");
      // Haptic feedback on error
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50 max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center shadow-neon-purple">
              <Shield className="w-8 h-8 text-secondary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-black tracking-wide">
            {title}
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            Enter admin credentials to continue
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-11"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              className="flex-1"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? "Verifying..." : "Authenticate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
