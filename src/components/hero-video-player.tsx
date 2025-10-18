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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-play on hover (muted) - desktop only
  const handleMouseEnter = () => {
    if (videoRef.current && !isPlaying && window.innerWidth > 768) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current && isPlaying && isMuted && window.innerWidth > 768) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Show controls on hover - desktop only
  const handleMouseMove = () => {
    if (window.innerWidth > 768) {
      setShowControls(true);
      setTimeout(() => setShowControls(false), 3000);
    }
  };

  // Touch support for mobile
  const handleTouchStart = () => {
    if (window.innerWidth <= 768) {
      setShowControls(true);
      setTimeout(() => setShowControls(false), 3000);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative group cursor-pointer ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onClick={togglePlay}
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
          preload="metadata"
          onEnded={() => setIsPlaying(false)}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
        
        {/* Play Button Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-6 shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <Play className="h-12 w-12 text-talween-purple ml-1" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Click to Listen Button */}
        {isPlaying && isMuted && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              size="sm"
              className="bg-white/90 backdrop-blur-sm hover:bg-white text-talween-purple border-0 shadow-lg text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <VolumeX className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">اضغط للاستماع</span>
              <span className="sm:hidden">استمع</span>
            </Button>
          </div>
        )}

        {/* Controls Overlay */}
        {(showControls || isFullscreen) && (
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-lg p-2 sm:p-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-1 sm:p-2"
              >
                {isPlaying ? (
                  <div className="w-0 h-0 border-l-[4px] sm:border-l-[6px] border-l-white border-y-[3px] sm:border-y-[4px] border-y-transparent ml-0.5 sm:ml-1" />
                ) : (
                  <Play className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" />
                )}
              </Button>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-1 sm:p-2"
              >
                {isMuted ? <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" /> : <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-1 sm:p-2"
            >
              <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}

        {/* Fullscreen Close Button */}
        {isFullscreen && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:bg-white/20 p-1 sm:p-2"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>

      {/* Floating Play Icon */}
      <div className="absolute -top-6 -right-6 bg-gradient-to-r from-green-400 to-blue-400 p-4 rounded-full shadow-xl animate-bounce">
        <Play className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}
