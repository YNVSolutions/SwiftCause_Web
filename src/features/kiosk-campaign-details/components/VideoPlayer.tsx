import React from 'react';
import { VideoPlayerProps } from '../types';
import { getYouTubeEmbedUrl } from '../lib/videoUtils';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  if (!videoUrl) return null;

  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  if (!embedUrl) return null;

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-green-50 border border-green-100 shadow-sm">
      <div className="aspect-video">
        <iframe
          src={embedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          title="Campaign Video"
        />
      </div>
    </div>
  );
};
