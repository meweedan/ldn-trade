import React, { useRef, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { useResourceProgress } from './ResourceProgressTracker';

interface TrackedVideoProps {
  resourceId?: string; // Optional now
  src: string;
  tierId: string; // Required for tracking
  onContextMenu?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  controls?: boolean;
  playsInline?: boolean;
  disablePictureInPicture?: boolean;
  controlsList?: string;
  onEnded?: () => void;
  watermark?: React.ReactNode;
}

export const TrackedVideo: React.FC<TrackedVideoProps> = ({
  resourceId,
  src,
  tierId,
  onContextMenu,
  style,
  controls = true,
  playsInline = true,
  disablePictureInPicture = true,
  controlsList = 'nodownload noplaybackrate',
  onEnded,
  watermark,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { markCompleted, updatePosition } = useResourceProgress(src, 'video', tierId);
  const lastSaveTimeRef = useRef(Date.now());

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const now = Date.now();
      
      // Save position every 30 seconds
      if (now - lastSaveTimeRef.current > 30000) {
        updatePosition(Math.floor(currentTime));
        lastSaveTimeRef.current = now;
      }
    };

    const handleEnded = async () => {
      const duration = video.duration;
      await markCompleted(Math.floor(duration));
      onEnded?.();
    };

    // Track when user watches 90% of the video
    const handleProgress = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      
      if (duration > 0 && currentTime / duration >= 0.9) {
        // Consider video watched at 90%
        markCompleted(Math.floor(currentTime));
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleProgress);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleProgress);
    };
  }, [markCompleted, updatePosition, onEnded]);

  return (
    <Box position="relative">
      <video
        ref={videoRef}
        src={src}
        controls={controls}
        playsInline={playsInline}
        disablePictureInPicture={disablePictureInPicture}
        controlsList={controlsList}
        style={style}
        onContextMenu={onContextMenu}
      />
      {watermark}
    </Box>
  );
};

export default TrackedVideo;
