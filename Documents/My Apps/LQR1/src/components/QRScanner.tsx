import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Camera, Upload, X, ScanLine, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export const QRScanner = ({ isOpen, onClose, onScan }: QRScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
      } catch (error) {
        console.log("Scanner stop error:", error);
      }
    }
    setIsScanning(false);
  }, []);

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    await stopScanner();
    onScan(decodedText);
    onClose();
  }, [onScan, onClose, stopScanner]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      // Get available cameras
      const cameras = await Html5Qrcode.getCameras();
      
      if (cameras.length === 0) {
        setCameraError("No camera found on this device");
        return;
      }

      // Prefer back camera
      const backCamera = cameras.find(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('rear')
      );
      
      const cameraId = backCamera?.id || cameras[cameras.length - 1].id;

      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        handleScanSuccess,
        () => {} // Ignore scan errors (no QR found)
      );

      setIsScanning(true);
    } catch (error: any) {
      console.error("Camera error:", error);
      setCameraError(error.message || "Failed to access camera. Please try uploading an image.");
    }
  }, [handleScanSuccess]);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startCamera();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
  }, [isOpen, startCamera, stopScanner]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      const result = await scannerRef.current.scanFile(file, true);
      handleScanSuccess(result);
    } catch (error) {
      toast({
        title: "QR Code Not Found",
        description: "Could not detect a QR code in the uploaded image.",
        variant: "destructive",
      });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50 max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span className="text-lg font-black tracking-wide">Scan QR Code</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          {/* Scanner Container */}
          <div className="relative rounded-2xl overflow-hidden bg-zinc-950 aspect-square">
            <div id="qr-reader" className="w-full h-full" />
            
            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Corner markers */}
                <div className="absolute top-8 left-8 w-12 h-12 border-l-4 border-t-4 border-neon-cyan rounded-tl-lg" />
                <div className="absolute top-8 right-8 w-12 h-12 border-r-4 border-t-4 border-neon-cyan rounded-tr-lg" />
                <div className="absolute bottom-8 left-8 w-12 h-12 border-l-4 border-b-4 border-neon-cyan rounded-bl-lg" />
                <div className="absolute bottom-8 right-8 w-12 h-12 border-r-4 border-b-4 border-neon-cyan rounded-br-lg" />
                
                {/* Scan line */}
                <div className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-neon-cyan to-transparent scan-line" 
                     style={{ top: '20%' }} />
              </div>
            )}

            {/* Camera Error State */}
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 p-6 text-center">
                <Camera className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">{cameraError}</p>
              </div>
            )}

            {/* Loading State */}
            {!isScanning && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
                <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
              </div>
            )}
          </div>

          {/* Upload Option */}
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="qr-upload"
            />
            <Button
              variant="glass"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload QR Image
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Position the QR code within the frame to scan
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
