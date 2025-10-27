import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';
import { 
  Camera, 
  CameraOff, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  QrCode,
  Loader2
} from 'lucide-react';

interface QRCodeScannerProps {
  onScanSuccess: (qrData: string) => void;
  onScanError: (error: string) => void;
  isActive: boolean;
  onClose: () => void;
}

export function QRCodeScanner({ onScanSuccess, onScanError, isActive, onClose }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [lastScanResult, setLastScanResult] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Cleanup function
  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    setIsScanning(false);
  };

  // Initialize camera
  const initializeCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
        setIsScanning(true);
        
        // Start scanning after video loads
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          startScanning();
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      setError('Camera access denied or not available');
      onScanError('Camera access denied or not available');
    }
  };

  // Mock QR code detection (in real implementation, use a QR library like jsQR)
  const detectQRCode = (): string | null => {
    // This is a mock implementation
    // In a real app, you would use a library like jsQR to detect QR codes from the video stream
    
    // Simulate QR code detection with random success
    const mockQRCodes = [
      'KIOSK-NYC-001:TS2024',
      'KIOSK-SF-002:SF2024',
      'KIOSK-LA-003:LA2024',
      'KIOSK-CHI-004:CH2024',
      'KIOSK-MIA-005:MI2024'
    ];
    
    // Simulate detection with 10% chance per scan
    if (Math.random() < 0.1) {
      return mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
    }
    
    return null;
  };

  const startScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      if (!isScanning || !videoRef.current) return;

      const qrData = detectQRCode();
      if (qrData && qrData !== lastScanResult) {
        setLastScanResult(qrData);
        setIsScanning(false);
        onScanSuccess(qrData);
        cleanup();
      }
    }, 500); // Scan every 500ms
  };

  const handleStartScan = () => {
    setError('');
    initializeCamera();
  };

  const handleStopScan = () => {
    cleanup();
    onClose();
  };

  const handleRetry = () => {
    cleanup();
    setTimeout(() => {
      initializeCamera();
    }, 100);
  };

  // Cleanup on unmount or when inactive
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      cleanup();
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <QrCode className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle>Scan Kiosk QR Code</CardTitle>
          <CardDescription>
            Point your camera at the kiosk QR code to login instantly
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Camera View */}
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {hasPermission === null && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm">Requesting camera access...</p>
                </div>
              </div>
            )}

            {hasPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <CameraOff className="mx-auto h-12 w-12 mb-4 text-red-400" />
                  <p className="text-sm mb-2">Camera access denied</p>
                  <p className="text-xs opacity-75">Please enable camera permissions</p>
                </div>
              </div>
            )}

            {hasPermission === true && (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            )}

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0">
                {/* Scanning frame */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-48 border-2 border-white rounded-lg">
                    {/* Corner indicators */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>
                    
                    {/* Scanning line animation */}
                    <div className="absolute inset-x-2 top-2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Scanning...
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-2 text-center">
            <p className="text-sm text-gray-600">
              Position the QR code within the scanning frame
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Auto-detection</span>
              </div>
              <div className="flex items-center space-x-1">
                <Camera className="w-3 h-3" />
                <span>Back camera preferred</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {!isScanning && hasPermission !== true ? (
              <Button onClick={handleStartScan} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
            
            <Button onClick={handleStopScan} variant="outline">
              Cancel
            </Button>
          </div>

          {/* Alternative Option */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Having trouble? Try manual entry instead
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}