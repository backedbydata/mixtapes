import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, X, RotateCcw, Check, Image as ImageIcon } from 'lucide-react';
import { Button, Card } from '../ui';

interface ImageCaptureProps {
  onImageCaptured: (imageDataUrl: string, file: File) => void;
  side?: 'A' | 'B';
}

export function ImageCapture({ onImageCaptured, side }: ImageCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [showCamera]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setCameraReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      setCameraError('Unable to access camera. Please try uploading an image instead.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCameraReady(false);
  }, []);

  const handleVideoLoaded = () => {
    setCameraReady(true);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `mixtape-${side || 'scan'}-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCapturedFile(file);
      }
    }, 'image/jpeg', 0.9);

    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      setCapturedFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (capturedImage && capturedFile) {
      onImageCaptured(capturedImage, capturedFile);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedFile(null);
  };

  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={handleVideoLoaded}
            onCanPlay={handleVideoLoaded}
            className={`w-full h-full object-cover transition-opacity duration-300 ${cameraReady ? 'opacity-100' : 'opacity-0'}`}
          />
          {!cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm">Starting camera...</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-2 border-white/50 rounded-lg" />
            <div className="absolute top-1/2 left-8 right-8 h-px bg-white/30" />
          </div>
        </div>
        <div className="p-6 bg-black/80 flex items-center justify-center gap-6">
          <button
            onClick={stopCamera}
            className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={capturePhoto}
            disabled={!cameraReady}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <div className="w-16 h-16 rounded-full border-4 border-neutral-900" />
          </button>
          <div className="w-14" />
        </div>
      </div>
    );
  }

  if (capturedImage) {
    return (
      <Card padding="none" className="overflow-hidden">
        <div className="relative">
          <img
            src={capturedImage}
            alt="Captured mixtape"
            className="w-full h-auto max-h-[60vh] object-contain bg-neutral-100"
          />
          {side && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm font-medium">
              Side {side}
            </div>
          )}
        </div>
        <div className="p-4 flex items-center justify-between gap-4 bg-white border-t border-neutral-200">
          <Button variant="ghost" onClick={handleRetake} icon={<RotateCcw className="w-4 h-4" />}>
            Retake
          </Button>
          <Button onClick={handleConfirm} icon={<Check className="w-4 h-4" />}>
            Use This Image
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="text-center">
      <div className="py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-neutral-400" />
        </div>

        {side && (
          <div className="inline-block px-3 py-1 rounded-full bg-secondary-100 text-secondary-700 text-sm font-medium mb-4">
            Side {side}
          </div>
        )}

        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          Capture your song list
        </h3>
        <p className="text-neutral-600 mb-8 max-w-sm mx-auto">
          Take a photo or upload an image of your handwritten song list
        </p>

        {cameraError && (
          <div className="mb-6 p-3 rounded-lg bg-accent-50 border border-accent-200 text-accent-700 text-sm max-w-sm mx-auto">
            {cameraError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={startCamera} icon={<Camera className="w-5 h-5" />}>
            Take Photo
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-5 h-5" />}
          >
            Upload Image
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </Card>
  );
}
