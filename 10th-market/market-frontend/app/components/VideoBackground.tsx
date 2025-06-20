'use client';

import { memo, useCallback, useRef, useEffect } from 'react';

interface ThemeClasses {
  videoOverlay: string;
  gradientOverlay: string;
}

interface VideoBackgroundProps {
  themeClasses: ThemeClasses;
}

function VideoBackground({ themeClasses }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // 优化视频设置
  const setupVideo = useCallback((video: HTMLVideoElement | null) => {
    if (video) {
      video.playbackRate = 0.8;
      // 预加载优化
      video.preload = 'metadata';
    }
  }, []);

  useEffect(() => {
    setupVideo(videoRef.current);
  }, [setupVideo]);

  return (
    <div className="absolute inset-0">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          filter: 'brightness(0.9) saturate(0.2) sepia(0.3) hue-rotate(200deg) contrast(1.1)' 
        }}
        aria-label="Background video showcasing blockchain technology"
        onLoadedData={() => setupVideo(videoRef.current)}
      >
        <source src="/1g8IkhtJmlWcC4zEYWKUmeGWzI.mp4" type="video/mp4" />
        <track kind="descriptions" srcLang="en" label="English descriptions" />
      </video>
      
      {/* Theme-aware overlay */}
      <div className={`absolute inset-0 ${themeClasses.videoOverlay}`} />
      
      {/* Video overlay */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Subtle gradient overlay */}
      <div className={`absolute inset-0 ${themeClasses.gradientOverlay}`} />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:30px_30px]" />
      </div>
    </div>
  );
}

export default memo(VideoBackground); 