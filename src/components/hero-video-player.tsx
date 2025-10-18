'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Volume2, VolumeX, X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroVideoPlayerProps {
  videoSrc: string;
  poster?: string;
  className?: string;
}

export function HeroVideoPlayer({ videoSrc, poster, className = '' }: HeroVideoPlayerProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Start video loop on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  // Toggle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Show controls
  const showControlsTemporarily = () => {
    setShowControls(true);
    setTimeout(() => setShowControls(false), 3000);
  };

  // Double click to fullscreen
  const handleDoubleClick = () => {
    toggleFullscreen();
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative group ${className}`}
      onMouseMove={showControlsTemporarily}
      onTouchStart={showControlsTemporarily}
      onDoubleClick={handleDoubleClick}
    >
      {/* Video Container */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          src={videoSrc}
          poster={poster}
          className="w-full h-full object-cover"
          muted={isMuted}
          loop
          playsInline
          autoPlay
          preload="metadata"
        />
        
        {/* Click to Watch Tag */}
        <div className="absolute top-4 left-4 right-4 flex justify-center">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="bg-white/90 backdrop-blur-sm hover:bg-white text-talween-purple border-0 shadow-lg px-4 py-2 rounded-full font-semibold"
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4 mr-2" />
                اضغط للمشاهدة مع الصوت
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                اضغط لإيقاف الصوت
              </>
            )}
          </Button>
        </div>

        {/* Controls Overlay - Only in Fullscreen */}
        {isFullscreen && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Floating Play Icon */}
      <div className="absolute -top-6 -right-6 bg-gradient-to-r from-green-400 to-blue-400 p-4 rounded-full shadow-xl animate-bounce">
        <Play className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}
